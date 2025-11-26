# Scalable URL Shortener Service

A scalable RESTful API backend for a URL shortening service built with Node.js, Express, MongoDB, and Redis. This project demonstrates proficiency in backend development, caching strategies, and system design principles.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Design & Architecture](#system-design--architecture)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)

## Features
- [cite_start]**Shorten URL:** Generates a unique 6-character alphanumeric code for any long URL[cite: 12].
- [cite_start]**Fast Redirection:** Uses Redis caching to provide low-latency redirection to the original URL[cite: 17].
- [cite_start]**Analytics:** Tracks the total number of clicks/accesses for every short code[cite: 25].
- **Scalable Architecture:** Designed to handle high traffic loads with caching and database optimization.

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- [cite_start]**Database:** MongoDB (Primary Storage) [cite: 31]
- [cite_start]**Cache:** Redis (High-speed retrieval) [cite: 3]
- **Tools:** Mongoose, Nanoid

---

## System Design & Architecture

### 1. Database Choice: MongoDB
We selected **MongoDB** as the primary database for storing URL mappings.
* **Justification:** The data model for a URL shortener is document-oriented (storing a mapping of `shortCode`, `longUrl`, and `meta-data`). It does not require complex joins typical of relational databases like MySQL.
* **Advantages:**
    * **Read Performance:** MongoDB offers high read throughput, which is essential for a redirection service that is read-heavy.
    * [cite_start]**Scaling:** MongoDB's built-in support for **Sharding** allows the system to scale horizontally easily as the dataset grows[cite: 32].
    * **Schema Flexibility:** Allows for easy addition of future analytics fields (e.g., user agent, geo-location) without rigid schema migrations.

### 2. The Role of Redis
Redis is implemented as a **Look-aside Cache** to optimize the Redirection Endpoint.
* **Role:** When a redirection request comes in, the system first checks Redis. If the data exists, it redirects immediately. [cite_start]If not, it fetches from MongoDB, updates Redis, and then redirects[cite: 17, 18, 20].
* **Problem Solved:** It solves the **latency and database load** problem. In a URL shortener, following the Pareto Principle (80/20 rule), a small percentage of links generate the majority of traffic. [cite_start]Redis keeps these "hot" links in memory, preventing the primary database from being overwhelmed by repetitive read requests[cite: 35].



### 3. Scaling for High Availability (100k RPS)
To handle 100,000 requests per second, the following architectural changes are proposed:
* **Node.js/Express Layer:**
    * **Clustering:** Use the Node.js Cluster module or a process manager like PM2 to utilize all CPU cores on the server instance.
    * [cite_start]**Load Balancing:** Deploy multiple instances of the application behind a Load Balancer (e.g., Nginx, AWS ELB) to distribute incoming traffic evenly across servers[cite: 37, 38].
* **Database Layer:**
    * **Read Replicas:** Implement a Master-Slave architecture where the Master handles writes (creating short URLs) and multiple Read Replicas handle the redirection lookups.
    * **Sharding:** Partition the database based on the hash of the `shortCode`. [cite_start]This distributes the data across multiple database nodes to prevent any single node from becoming a bottleneck[cite: 39].

### 4. Collision Handling Strategy
* [cite_start]**Strategy:** We generate unique 6-character alphanumeric codes (e.g., `AbCd1E`) using a library like `nanoid` or a base62 encoding algorithm[cite: 12].
* **Handling Collisions:**
    1. Generate a candidate code.
    2. Check the database (or a fast Bloom Filter) to see if the code already exists.
    3. If a collision is detected, regenerate the code and repeat the check.
* **Trade-offs:** This "check-then-write" strategy ensures data integrity but introduces a slight latency penalty during the creation process. [cite_start]However, given the vast number of combinations ($62^6 \approx 56.8$ billion), collisions are statistically rare in the early stages[cite: 43, 44].

---

## Getting Started

[cite_start]Follow these instructions to set up and run the project locally[cite: 47].

### Prerequisites
Ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v14+)
* [MongoDB](https://www.mongodb.com/) (Running locally or via Atlas)
* [Redis](https://redis.io/) (Running locally)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-link-here>
    cd url-shortener-service
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Configuration:**
    Create a `.env` file in the root directory and add the following configuration:
    ```env
    PORT=3000
    MONGO_URI=mongodb://localhost:27017/urlshortener
    REDIS_URL=redis://localhost:6379
    BASE_URL=http://localhost:3000
    ```

4.  **Start the Services:**
    * Ensure MongoDB is running (`mongod`).
    * Ensure Redis is running (`redis-server`).

5.  **Run the Application:**
    ```bash
    npm start
    ```
    The server should start on port 3000.

---

## API Endpoints

### 1. Shorten URL
* **Method:** `POST`
* **Path:** `/api/v1/shorten`
* **Body:** `{ "longUrl": "https://www.google.com" }`
* [cite_start]**Description:** Generates a short code and stores the mapping[cite: 9, 10].

### 2. Redirect URL
* **Method:** `GET`
* **Path:** `/:shortCode`
* **Description:** Redirects the user to the original URL. [cite_start]Updates click count asynchronously[cite: 16].

### 3. Analytics
* **Method:** `GET`
* **Path:** `/api/v1/analytics/:shortCode`
* [cite_start]**Description:** Returns the total click count for the given short code[cite: 23].
