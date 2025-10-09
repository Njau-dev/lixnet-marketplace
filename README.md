# Lixnet Marketplace

This is a **Laravel 12 + React** project.  
Laravel provides the backend, while React (via the official Laravel frontend scaffold) is used for the frontend inside `resources/js`.

---

## Requirements

- **PHP**: v8.2 or higher  
- **Composer**: v2  
- **Node.js**: v18 or higher (includes `npm`)  
- **MySQL**: v8 or compatible  
- **Git**

---

## Installation & Setup

1. **Clone the repository**
   ```
   git clone https://github.com/Njau-dev/lixnet-marketplace.git
   cd lixnet-marketplace
   ```
   
2. **Install Dependencies**
   ```
   composer install
   npm install
   ```
   
3. **Configure environment**
    ```
    cp .env.example .env
    php artisan key:generate
    ```

4. **Create a MySQL database**
    ```
    mysql -u root -p
    CREATE DATABASE lixnet_marketplace;
    EXIT;
    ```

5. **Configure .env Credentials**
    ```
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=lixnet_marketplace
    DB_USERNAME=root
    DB_PASSWORD=your_password
    ```

6. **Run migrations and seeders**
    ```
    php artisan migrate --seed
    ```

7. **Start the development server**
    ```
    Composer run dev
    ```


   The project will be available at 👉 http://localhost:8000
