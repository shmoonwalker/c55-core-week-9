import { fetchNobelPrizes } from './services.js';

export default class UI {
  constructor() {
    this.state = {
      prizes: [],
      currentPage: 1,
      totalPrizes: 0,
      itemsPerPage: 10,
      filters: {
        year: null,
        category: 'all',
      },
    };
    this.dom = this.getElementsWithIds(document);
  }

  initialize() {
    // Populate year select dropdown
    this.populateYearSelect();

    // Set up event listeners
    this.dom.categorySelect.addEventListener('change', () => {
      this.loadPrizes();
    });

    this.dom.yearSelect.addEventListener('change', () => {
      this.loadPrizes();
    });

    this.dom.prevBtn.addEventListener('click', () => {
      this.previousPage();
    });

    this.dom.nextBtn.addEventListener('click', () => {
      this.nextPage();
    });

    this.dom.firstBtn.addEventListener('click', () => {
      this.firstPage();
    });

    this.dom.lastBtn.addEventListener('click', () => {
      this.lastPage();
    });

    // Load initial data
    this.loadInitialData();
  }

  /**
   * Get all elements with IDs and convert to camelCase object
   */
  getElementsWithIds(root) {
    const elements = root.querySelectorAll('[id]');
    return Array.from(elements).reduce((obj, element) => {
      const name = element.id
        .split('-')
        .map((part, index) => {
          if (index === 0) return part;
          return part.charAt(0).toUpperCase() + part.slice(1);
        })
        .join('');
      obj[name] = element;
      return obj;
    }, {});
  }

  /**
   * Populate year select dropdown with years from 1901 to current year
   */
  populateYearSelect() {
    const currentYear = new Date().getFullYear();
    const startYear = 1901;

    // Add 'All' option first
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'All';
    this.dom.yearSelect.appendChild(allOption);

    // Add years in descending order (newest first)
    for (let year = currentYear; year >= startYear; year--) {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      this.dom.yearSelect.appendChild(option);
    }
  }

  /**
   * Load initial data with 'All' years selected
   */
  loadInitialData() {
    // Set the initial year to 'all' in dropdown
    this.dom.yearSelect.value = 'all';
    this.state.filters.year = 'all';

    // Load prizes for all years
    this.loadPrizes();
  }

  /**
   * Load prizes based on current filters
   */
  loadPrizes(page = 1) {
    this.showLoading();

    // Get filter values
    const category = this.dom.categorySelect.value;
    const year = this.dom.yearSelect.value;

    // Update state
    this.state.filters.category = category;
    this.state.filters.year = year;
    this.state.currentPage = page;

    // Calculate offset
    const offset = (page - 1) * this.state.itemsPerPage;

    // Fetch data
    fetchNobelPrizes(
      {
        year: year,
        category: category,
        offset: offset,
        limit: this.state.itemsPerPage,
        sort : 'desc',
      },
      (data) => {
        // Update state with results
        this.state.prizes = data.nobelPrizes || [];
        this.state.totalPrizes = data.meta?.count || 0;

        // Render results
        this.renderPrizes();
        this.updatePagination();
        this.updatePrizesInfo();

        this.hideLoading();
      },
      (error) => {
        console.error('Error loading prizes:', error);
        this.showError('Failed to load Nobel Prizes. Please try again.');
        this.hideLoading();
      }
    );
  }

  /**
   * Render prize cards
   */
  renderPrizes() {
    const container = this.dom.prizesContainer;
    container.innerHTML = '';

    if (this.state.prizes.length === 0) {
      container.innerHTML =
        '<div class="empty-state">No prizes found for the selected filters.</div>';
      return;
    }

    this.state.prizes.forEach((prize) => {
      const card = this.createPrizeCard(prize);
      container.appendChild(card);
    });
  }

  /**
   * Create a prize card element
   */
  createPrizeCard(prize) {
    const card = document.createElement('div');
    const categoryCode = prize.categoryFullName?.en
      ? this.getCategoryCode(prize.categoryFullName.en)
      : 'phy';
    card.className = `prize-card ${categoryCode}`;

    // Create header
    const header = document.createElement('div');
    header.className = 'prize-header';

    const yearElement = document.createElement('div');
    yearElement.className = 'prize-year';
    yearElement.textContent = prize.awardYear || 'N/A';

    const categoryElement = document.createElement('div');
    categoryElement.className = `prize-category ${categoryCode}`;
    categoryElement.textContent = this.formatCategory(
      prize.categoryFullName?.en || 'Unknown'
    );

    header.appendChild(yearElement);
    header.appendChild(categoryElement);

    // Create laureates section
    const laureatesSection = document.createElement('div');
    laureatesSection.className = 'laureates-section';

    const laureatesTitle = document.createElement('div');
    laureatesTitle.className = 'laureates-title';
    laureatesTitle.textContent = 'Laureate(s):';

    laureatesSection.appendChild(laureatesTitle);

    // Add each laureate
    if (prize.laureates && prize.laureates.length > 0) {
      prize.laureates.forEach((laureate) => {
        const laureateItem = this.createLaureateItem(laureate);
        laureatesSection.appendChild(laureateItem);
      });
    } else {
      const noLaureate = document.createElement('div');
      noLaureate.className = 'laureate-item';
      noLaureate.textContent = 'No laureates information available';
      laureatesSection.appendChild(noLaureate);
    }

    card.appendChild(header);
    card.appendChild(laureatesSection);

    return card;
  }

  /**
   * Create a laureate item element
   */
  createLaureateItem(laureate) {
    const item = document.createElement('div');
    item.className = 'laureate-item';

    const nameElement = document.createElement('div');
    nameElement.className = 'laureate-name';

    // Handle both individual and organization laureates
    if (laureate.knownName) {
      nameElement.textContent = laureate.knownName.en || 'Unknown';
    } else if (laureate.orgName) {
      nameElement.textContent = laureate.orgName.en || 'Unknown Organization';
    } else if (laureate.fullName) {
      nameElement.textContent = laureate.fullName.en || 'Unknown';
    } else {
      nameElement.textContent = 'Unknown';
    }

    item.appendChild(nameElement);

    // Add motivation if available
    if (laureate.motivation) {
      const motivationElement = document.createElement('div');
      motivationElement.className = 'laureate-motivation';
      motivationElement.textContent = laureate.motivation.en || '';
      item.appendChild(motivationElement);
    }

    return item;
  }

  /**
   * Get category code from full name
   */
  getCategoryCode(categoryName) {
    const mapping = {
      Physics: 'phy',
      Chemistry: 'che',
      'Physiology or Medicine': 'med',
      Literature: 'lit',
      Peace: 'pea',
      'Economic Sciences': 'eco',
    };
    return mapping[categoryName] || 'phy';
  }

  /**
   * Format category name for display
   */
  formatCategory(categoryName) {
    return categoryName
      .replace('The Nobel Prize in ', '')
      .replace('Physiology or ', '');
  }

  /**
   * Update pagination controls
   */
  updatePagination() {
    const totalPages = Math.ceil(
      this.state.totalPrizes / this.state.itemsPerPage
    );
    const normalizedTotalPages = Math.max(totalPages, 1);

    // Update page info
    this.dom.pageInfo.textContent = `Page ${this.state.currentPage} of ${normalizedTotalPages}`;

    // Update button states
    this.dom.prevBtn.disabled = this.state.currentPage === 1;
    this.dom.nextBtn.disabled = this.state.currentPage >= normalizedTotalPages;
    this.dom.firstBtn.disabled = this.state.currentPage === 1;
    this.dom.lastBtn.disabled = this.state.currentPage >= normalizedTotalPages;
  }

  /**
   * Update prizes count info
   */
  updatePrizesInfo() {
    const count = this.state.totalPrizes;
    const plural = count !== 1 ? 'prizes' : 'prize';
    this.dom.prizesCount.textContent = `${count} ${plural} found`;
  }

  /**
   * Go to previous page
   */
  async previousPage() {
    if (this.state.currentPage > 1) {
      await this.loadPrizes(this.state.currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Go to first page
   */
  async firstPage() {
    if (this.state.currentPage !== 1) {
      await this.loadPrizes(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Go to next page
   */
  async nextPage() {
    const totalPages = Math.ceil(
      this.state.totalPrizes / this.state.itemsPerPage
    );
    const normalizedTotalPages = Math.max(totalPages, 1);
    if (this.state.currentPage < normalizedTotalPages) {
      await this.loadPrizes(this.state.currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Go to last page
   */
  async lastPage() {
    const totalPages = Math.ceil(
      this.state.totalPrizes / this.state.itemsPerPage
    );
    const normalizedTotalPages = Math.max(totalPages, 1);
    if (this.state.currentPage < normalizedTotalPages) {
      await this.loadPrizes(normalizedTotalPages);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Show loading indicator
   */
  showLoading() {
    this.dom.loading.classList.add('active');
    this.dom.errorMessage.classList.remove('active');
  }

  /**
   * Hide loading indicator
   */
  hideLoading() {
    this.dom.loading.classList.remove('active');
  }

  /**
   * Show error message
   */
  showError(message) {
    const errorElement = this.dom.errorMessage;
    errorElement.textContent = message;
    errorElement.classList.add('active');
    this.hideLoading();
  }
}
