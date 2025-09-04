# FinBoard Documentation

## 🚀 Project Overview

FinBoard is a customizable financial dashboard that allows you to create a personalized overview of the financial markets. Track stocks, cryptocurrencies, and other financial data in real-time with a variety of widgets that can be arranged to suit your needs.

**Deployed Link:** [\[\Finboard]](https://finboard-green.vercel.app/)

## 📂 Project Structure and File Documentation

The project is organized into the following directories:

  * **`/app`**: Contains the main application pages and layouts.
      * `page.tsx`: The main entry point of the application, responsible for rendering the dashboard, widgets, and the "Add Widget" modal.
      * `layout.tsx`: The root layout of the application, which includes the global styles and font configuration.
  * **`/components`**: Includes all the React components used in the application.
      * `Widget.tsx`: A generic widget component that provides the basic structure for all widgets, including a title and a remove button.
      * `WidgetContent.tsx`: A component that dynamically renders the appropriate widget based on its type.
      * `SortableWidget.tsx`: A wrapper around the `Widget` component that adds drag-and-drop functionality using `dnd-kit`.
      * `OverviewWidget.tsx`: A widget that displays a company overview with key financial data.
      * `ChartWidget.tsx`: A widget that displays a historical stock chart using `Recharts`.
      * `TableWidget.tsx`: A widget that displays data in a table with sorting, filtering, and pagination.
      * `CardWidget.tsx`: A widget that displays financial data in a compact card or list format.
      * `AddWidgetForm.tsx`: A form for adding and editing widgets, allowing users to configure the widget's properties.
      * `Modal.tsx`: A reusable modal component for displaying the "Add Widget" form.
      * `Header.tsx`: The main header of the application, which includes the "Add Widget" button.
  * **`/lib`**: Contains utility functions and API configuration.
      * `apiConfig.ts`: Defines the API endpoints and provides mock data for the widgets.
      * `utils.ts`: A collection of utility functions for data manipulation and array operations.
  * **`/public`**: Contains static assets like images and SVGs.
  * **`/store`**:
      * `widgetStore.ts`: The Zustand store for managing the application's state, including the list of widgets and their configurations.
  * **`/types`**:
      * `widget.ts`: Defines the TypeScript types for the different widget configurations.

-----

### File-by-File Documentation

#### `app/page.tsx`

This is the main page of the application. It's responsible for rendering the dashboard, which includes the header, the list of widgets, and the "Add Widget" modal.

  * **State Management**: It uses the `useWidgetStore` hook to get the list of widgets and the functions to add, remove, and update them.
  * **Modal Handling**: It manages the state of the "Add Widget" modal, including opening and closing it.
  * **Drag and Drop**: It uses the `DndContext` and `SortableContext` components from `@dnd-kit` to enable drag-and-drop functionality for the widgets. The `handleDragEnd` function is called when a widget is dropped, and it updates the order of the widgets in the store.

#### `components/Widget.tsx`

This component provides the basic structure for all widgets. It includes a title, a remove button, and a container for the widget's content.

#### `components/WidgetContent.tsx`

This component acts as a router for rendering the correct widget based on its `type`. It uses a `switch` statement to determine which widget component to render, passing the widget's configuration as a prop. This makes it easy to add new widget types without modifying the main page component.

#### `components/SortableWidget.tsx`

This is a wrapper component that makes the `Widget` component draggable. It uses the `useSortable` hook from `@dnd-kit/sortable` to get the necessary props for enabling drag-and-drop.

#### `components/OverviewWidget.tsx`

This widget displays a company overview. It fetches data from a mock API endpoint and displays the selected fields in a list format.

  * **Data Fetching**: It uses the `useSWR` hook to fetch data from the mock API.
  * **Data Formatting**: The `formatValue` function is used to format the data for display. It can handle numbers, strings, and null values, and it can format large numbers into a more readable format (e.g., "$1.2B" for billions).

#### `components/ChartWidget.tsx`

This widget displays a historical stock chart. It uses the `Recharts` library to render the chart.

  * **Data Fetching**: It fetches data from a mock API endpoint using `useSWR`.
  * **Data Transformation**: The `transformApiData.chartData` function is used to transform the raw API data into a format that can be used by the `Recharts` library.
  * **Chart Rendering**: It uses the `LineChart`, `Line`, `XAxis`, `YAxis`, and `Tooltip` components from `Recharts` to render the chart.
  * **Mathematical Calculations**:
      * **Price Change**: The component calculates the price change and price change percentage over the last 30 days. The price change is calculated by subtracting the first price from the last price.
        ```
        priceChange = lastPrice - firstPrice
        ```
      * **Price Change Percentage**: The price change percentage is calculated by dividing the price change by the first price and multiplying by 100.
        ```
        priceChangePercent = (priceChange / firstPrice) * 100
        ```

#### `components/TableWidget.tsx`

This widget displays data in a table with sorting, filtering, and pagination.

  * **Data Fetching**: It fetches data from a real API endpoint (CoinGecko) using `useSWR`.
  * **Data Transformation**: The `tableData` is computed using a `useMemo` hook that transforms the raw API data into a more usable format.
  * **Sorting Algorithm**: The `sortedData` is computed using a `useMemo` hook that sorts the data based on the `sortConfig` state. The sorting algorithm can handle both numeric and string values. For numeric values, it subtracts the two values to determine their order. For string values, it converts them to lowercase and compares them alphabetically.
  * **Filtering Algorithm**: The `filteredData` is computed using a `useMemo` hook that filters the data based on the `searchTerm`. The algorithm converts the search term to lowercase and then checks if any of the values in each item include the search term.
  * **Pagination Algorithm**: The `paginatedData` is computed using a `useMemo` hook that slices the data based on the `currentPage` and `itemsPerPage`. The `totalPages` is calculated by dividing the total number of items by the number of items per page and rounding up to the nearest integer.
    ```
    totalPages = Math.ceil(filteredData.length / itemsPerPage)
    ```

#### `components/CardWidget.tsx`

This widget displays financial data in a compact card or list format.

  * **Data Fetching**: It fetches data from a mock API endpoint using `useSWR`.
  * **Data Formatting**: The `formatValue` function is used to format the data for display. It can handle numbers, strings, and null values, and it can format large numbers into a more readable format (e.g., "$1.2M" for millions).

#### `components/AddWidgetForm.tsx`

This component provides a form for adding and editing widgets. It allows users to configure the widget's title, type, data source, and other properties.

  * **State Management**: It uses the `useState` hook to manage the state of the form fields.
  * **API Testing**: The `handleTestApi` function allows users to test the API endpoint to ensure it's working correctly and to get a list of available fields.

#### `lib/apiConfig.ts`

This file defines the API endpoints used in the application and provides mock data for the widgets.

  * **API Endpoints**: The `API_ENDPOINTS` object contains the URLs for the different APIs used in the application.
  * **Mock Data**: The `MOCK_DATA` object contains mock data for the company overview, chart, table, and finance card widgets.
  * **Data Transformation**: The `transformApiData` object contains functions for transforming the raw API data into a format that can be used by the widgets.

#### `lib/utils.ts`

This file contains a collection of utility functions for data manipulation and array operations.

  * **`getObjectKeys`**: This function recursively gets all the keys from an object, using dot notation for nested keys.
  * **`getNestedValue`**: This function safely retrieves a nested value from an object using a dot-notation path string.
  * **`arrayMove`**: This function moves an element within an array from one position to another.

#### `store/widgetStore.ts`

This file defines the Zustand store for managing the application's state.

  * **State**: The store contains an array of `widgets` and functions for adding, removing, updating, and reordering them.
  * **Persistence**: It uses the `persist` middleware from Zustand to save the state to local storage, so the user's dashboard is preserved between sessions.

-----

## 🧠 Algorithms and Logic

### Widget Rendering

The `WidgetContent` component uses a `switch` statement to dynamically render the appropriate widget based on the `type` property of the widget's configuration. This allows for a flexible and extensible architecture where new widget types can be easily added.

### Drag and Drop

The drag-and-drop functionality is implemented using the `@dnd-kit/core` and `@dnd-kit/sortable` libraries. The main page component (`app/page.tsx`) wraps the widget list in a `DndContext` and `SortableContext` to enable drag-and-drop. The `SortableWidget` component uses the `useSortable` hook to make each widget draggable.

### Data Fetching and Caching

The application uses the **SWR** library for data fetching. Each widget component is responsible for fetching its own data, and SWR handles caching, revalidation, and other features automatically. This ensures that the data is always up-to-date without the need for manual data fetching logic.

### Table Widget Logic

The `TableWidget` component includes several algorithms for data manipulation:

  * **Sorting**: The `sortedData` is computed using a `useMemo` hook that sorts the data based on the current `sortConfig`. It can handle both numeric and string sorting.
  * **Filtering**: The `filteredData` is computed using a `useMemo` hook that filters the data based on the `searchTerm`. It performs a case-insensitive search across all the values in each item.
  * **Pagination**: The `paginatedData` is computed using a `useMemo` hook that slices the data based on the `currentPage` and `itemsPerPage`.

-----


## 🛠️ Technologies Used

  * **Next.js**: React framework for server-side rendering and static site generation.
  * **React**: A JavaScript library for building user interfaces.
  * **TypeScript**: A typed superset of JavaScript.
  * **Tailwind CSS**: A utility-first CSS framework.
  * **Zustand**: A small, fast, and scalable state-management solution.
  * **SWR**: A React Hooks library for data fetching.
  * **dnd-kit**: A modern, lightweight, drag-and-drop toolkit for React.
  * **Recharts**: A composable charting library for React.
  * **ESLint**: A pluggable and configurable linter tool.
  * **Prettier**: An opinionated code formatter.