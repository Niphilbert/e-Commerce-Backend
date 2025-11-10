# API Documentation

Base URL: `http://localhost:3000`

## Health

- `GET /health`
  - **Response 200**
    ```json
    {
      "status": "ok"
    }
    ```

## Auth

- `POST /api/auth/register`
  - **Body**
    ```json
    {
      "username": "jdoe",
      "email": "jdoe@example.com",
      "password": "Password123!"
    }
    ```
  - **Responses**
    - `201` User created
    - `400` Email or username already exists

- `POST /api/auth/login`
  - **Body**
    ```json
    {
      "email": "jdoe@example.com",
      "password": "Password123!"
    }
    ```
  - **Responses**
    - `200` Returns JWT and user profile
    - `401` Invalid credentials

## Products

- `GET /api/products`
  - **Query Params**
    - `page` (default `1`)
    - `limit` (default `10`)
    - `search` (optional, partial match on name)
  - **Response 200** Paginated list of products

- `GET /api/products/:id`
  - **Responses**
    - `200` Product details
    - `404` Not found

- `POST /api/products` _(Admin)_
  - **Headers**: `Authorization: Bearer <token>`
  - **Body**
    ```json
    {
      "name": "Laptop",
      "description": "High-end laptop",
      "price": 1999.99,
      "stock": 10,
      "category": "Electronics"
    }
    ```
  - **Responses**
    - `201` Product created
    - `400` Validation errors
    - `401`/`403` Unauthorized or forbidden

- `PUT /api/products/:id` _(Admin)_
  - **Headers**: `Authorization: Bearer <token>`
  - **Body**: Any subset of product fields
  - **Responses**
    - `200` Product updated
    - `404` Not found

- `DELETE /api/products/:id` _(Admin)_
  - **Headers**: `Authorization: Bearer <token>`
  - **Responses**
    - `200` Product deleted
    - `404` Not found

## Orders

- `POST /api/orders` _(Authenticated)_
  - **Headers**: `Authorization: Bearer <token>`
  - **Body**
    ```json
    [
      { "productId": "prod-1", "quantity": 2 },
      { "productId": "prod-2", "quantity": 1 }
    ]
    ```
  - **Responses**
    - `201` Order placed
    - `400` Validation or stock error
    - `404` One or more products missing

- `GET /api/orders` _(Authenticated)_
  - **Headers**: `Authorization: Bearer <token>`
  - **Response 200** List of orders for the user

## Error Format

All error responses follow:

```json
{
  "success": false,
  "message": "Error message",
  "object": null,
  "errors": []
}
```


