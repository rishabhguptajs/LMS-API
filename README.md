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
