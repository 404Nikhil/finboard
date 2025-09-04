## Project Overview

This project is a customizable financial dashboard called **FinBoard**. It allows users to create a personalized dashboard with various widgets to track stocks, cryptocurrencies, and other financial data in real-time. The application is built with Next.js and utilizes several modern web technologies to provide a flexible and interactive user experience.

### Features

  * **Customizable Dashboard**: Users can add, remove, and rearrange widgets to create a personalized dashboard that meets their specific needs.
  * **Variety of Widgets**: The application supports several types of widgets, including:
      * **Company Overview**: Displays key information about a specific stock, such as market capitalization, P/E ratio, and more.
      * **Chart**: Shows a historical stock chart for a given symbol.
      * **Table**: Presents market data in a tabular format, ideal for tracking cryptocurrencies or other lists of assets.
      * **Finance Card**: Offers a compact view for watchlists, top gainers, portfolio performance, and other financial metrics.
  * **Real-time Data**: Widgets can be configured to refresh automatically at different intervals, ensuring that the displayed information is always up-to-date.
  * **Drag-and-Drop Interface**: The dashboard supports drag-and-drop functionality, making it easy to rearrange widgets as desired.
  * **Modal-based Widget Configuration**: A modal interface allows users to easily add and edit widgets, with options to customize the title, data source, and displayed fields.
  * **Mock Data for Demo Purposes**: The application uses mock data for some of the widgets, allowing for a functional demo without requiring real API keys.
  * **API Integration**: The application is designed to fetch data from various financial APIs, with a flexible configuration that allows for easy integration with different data sources.

### Technologies Used

  * **Next.js**: A React framework for building server-side rendered and statically generated web applications.
  * **React**: A JavaScript library for building user interfaces.
  * **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.
  * **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs.
  * **Zustand**: A small, fast, and scalable state management solution for React.
  * **SWR**: A React Hooks library for data fetching, providing features like caching, revalidation, and more.
  * **dnd-kit**: A modern, lightweight, and extensible drag-and-drop toolkit for React.
  * **Recharts**: A composable charting library built on React components.
  * **ESLint**: A pluggable and configurable linter tool for identifying and reporting on patterns in JavaScript.
  * **Prettier**: An opinionated code formatter that enforces a consistent style.

### Project Structure

The project is organized into the following directories:

  * **`/app`**: Contains the main application pages and layouts.
  * **`/components`**: Includes all the React components used in the application, such as widgets, forms, and modals.
  * **`/lib`**: A collection of utility functions and API configuration files.
  * **`/public`**: Stores static assets like images and SVGs.
  * **`/store`**: Contains the Zustand store for managing the application's state.
  * **`/types`**: Defines the TypeScript types used throughout the project.

### How It Works

The application's core functionality revolves around the concept of "widgets," which are individual components that display specific financial data. The state of these widgets is managed by a Zustand store, which keeps track of their configuration, position, and other properties.

When a user adds a new widget, a modal form is displayed, allowing them to select the widget type and configure its settings. The form includes options to set the widget title, data source (API endpoint), refresh interval, and the specific data fields to display.

Once a widget is created, it is added to the dashboard, where it can be rearranged using drag-and-drop. Each widget is responsible for fetching its own data using the SWR library, which handles caching and revalidation automatically. The data is then transformed and displayed in the appropriate format, whether it's a chart, table, or a simple overview.

The application uses a combination of real and mock API endpoints. For example, the cryptocurrency table fetches real-time data from the CoinGecko API, while the company overview and chart widgets use mock data for demonstration purposes. This approach allows for a fully functional application without the need for users to provide their own API keys.