
curl -X PATCH http://localhost:3000/users/11 \
-H "Content-Type: application/json " \
-d '{"email" : "johndoe@example.com"}'