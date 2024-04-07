# LMS API

## Description
The LMS (Learning Management System) API is a backend service designed to manage courses, user authentication, and user profiles for an online learning platform.

## Functionalities
- User Authentication
- Course Management
- Course Enrollment
- Course Filtering
- Pagination

## API Endpoints

### User Authentication
#### Register User
- Endpoint: `POST /api/auth/register`

#### Login User
- Endpoint: `POST /api/auth/login`

#### Image Upload
- Endpoint: `POST /api/auth/upload`

#### Forgot Password
- Endpoint: `POST /api/auth/forgot-password`

#### Get User Profile
- Endpoint: `GET /api/users/profile`

#### Update User Profile
- Endpoint: `PUT /api/users/update`

### Course Management
#### Create Course (Superadmin Only)
- Endpoint: `POST /api/courses/new`

#### Update Course by ID (Superadmin Only)
- Endpoint: `PUT /api/courses/update/:id`

#### Delete Course by ID (Superadmin Only)
- Endpoint: `DELETE /api/courses/delete/:id`

#### View All Courses
- Endpoint: `GET /api/courses/all`

#### View Course by ID
- Endpoint: `GET /api/courses/course/details/:id`

#### Filter Courses
- Endpoint: `GET /api/courses/filter`

### Course Enrollment
#### Enroll in Course
- Endpoint: `POST /api/courses/enroll`

#### View Enrolled Courses
- Endpoint: `GET /api/courses/enrolled`


## How to Use
1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file and add the following environment variables:
```
JWT_SECRET=your_jwt_secret
PGDATABASE = your_postgres_database
PGUSER = your_postgres_user
PGPASSWORD = your_postgres_password
ENDPOINT_ID = your_endpoint_id
RESEND_API = your_resend_api
CLOUDINARY_CLOUD_NAME = your_cloudinary_cloud_name
CLOUDINARY_SECRET = your_cloudinary_secret
CLOUDINARY_KEY = your_cloudinary_key
EMAIL_ADDRESS = your_email_address
```
4. Run the server: `npm start`
5. Access the API at `http://localhost:5000`

## Thanks for Reading!
```
{
    "message": "I hope you found this helpful!",
    "author": "rishabhguptajs",
    "github": "github.com/rishabhguptajs"
}
```