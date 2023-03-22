# CoderManagement

CoderManagement is a NodeJS service with MongoDB

## Instructions

1. Clone the branch `main`.
2. Rename `.env.example` to `.env` and supply your own MongoDB URI or leave as is to use your local MongoDB URI.
3. Npm or yarn to install package.json
4. Use thunder to import `thunder-collection_management.json`
5. Reading models to Read the model file to understand the structure
6. Before go to controller, the request go to middleware to validation (accessToken , validate data request )

## URL `http://localhost:5000`

## Login

Go to **validations/authValidation.js** to see schema

`POST /auth/login` all can login

`PUT /auth/me` all can update

## User

Go to **validations/userValidation.js** to see schema

`POST /user` \*\*\* leader can create

`PUT /user/:userId` \*\*\* leader and Senior can update

`PUT /user/progress/me` \*\*\* leader and Senior can update

`GET /user/` \*\*\* leader and Senior can get

`GET /user/:userId` \*\*\* leader and Senior can get

## TASk

Go to **validations/TaskValidation.js** to see schema

`POST /task` \*\*\* leader can create

`PUT /task/:userId` \*\*\* Senior can update

`PUT /task/status/:taskId` \*\*\* senior && leader can update

`GET /task/` \*\*\* all can get

## AccessToken

## all password : tuan123

`Leader`

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxlYWRlckBsZWFkZXIuY29tIiwicG9zaXRpb24iOiJMZWFkZXIiLCJpYXQiOjE2Nzk1MDU4MzAsImV4cCI6MTY3OTY3ODYzMH0.nv6ZqaCB2whjiV81cMlqD2-S-S_Jpjh8Qh8-12GcFIU

`senior`

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1haUBnbWFpbC5jb20iLCJwb3NpdGlvbiI6IlNlbmlvciIsImlhdCI6MTY3OTUwNTc5NCwiZXhwIjoxNjc5Njc4NTk0fQ.pC1vkatqi4BAhii2maQrZLoQeE-kutTV_qdhD7qz-NA

`junior`

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InR1YW50aGFwQGdtYWlsLmNvbSIsInBvc2l0aW9uIjoiSnVuaW9yIiwiaWF0IjoxNjc5NTA1NzY0LCJleHAiOjE2Nzk2Nzg1NjR9.mKuc02Tq5sp4EnJISfpMCNuXJWuxHz73ZzhUxhXYsPw
