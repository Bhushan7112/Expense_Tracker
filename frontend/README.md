Key design:
I kept the project structure simple by separating the frontend and backend into two folders. The frontend is built with React for a clean and responsive user interface, while the backend uses FastAPI because it is lightweight, fast, and easy to build REST APIs with.

Instead of using a database, I used a JSON file for storage. This was a practical choice for the time-limited assignment because it keeps setup simple and allows the application to run immediately without any external dependencies.

The UI was designed with a focus on clarity and usability rather than heavy styling. I prioritized core functionality such as adding expenses, filtering, sorting, deleting, totals, and category summaries.

Trade-offs:
I chose simple file-based persistence over a full database solution, which reduced setup time and complexity.
I did not make

Things Intentionally Not Done:
Advanced features like editing existing expenses, exporting reports, recurring expenses, charts/analytics, or pagination were intentionally left out to keep the solution focused and complete within the available time.
