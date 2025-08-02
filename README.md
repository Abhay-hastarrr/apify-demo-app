# Apify Integration Demo Application

This web application demonstrates integration with the Apify platform, allowing users to:

- Authenticate using their Apify API key
- Browse available actors
- View actor input schemas dynamically
- Execute actor runs with custom inputs
- View results immediately

## Features

- **Dynamic Schema Loading**: Fetches actor schemas directly from Apify API
- **Single-Run Execution**: Each request executes one actor run and shows results immediately
- **Error Handling**: Clear feedback for API key validation, actor execution, etc.
- **Minimal Dependencies**: Built with vanilla JavaScript frontend and a lightweight Express backend

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- An Apify account with an API key

### Setup

1. Clone this repository or download the source code

2. Install dependencies:
   ```
   npm install
   ```

3. Start the application:
   ```
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Usage Guide

1. **Authentication**:
   - Enter your Apify API key in the authentication section
   - Click "Validate" to verify your API key

2. **Actor Selection**:
   - Once authenticated, select an actor from the dropdown menu
   - The actor's description will be displayed

3. **Input Configuration**:
   - The input form is dynamically generated based on the actor's input schema
   - Fill in the required fields and any optional fields as needed

4. **Run Actor**:
   - Click "Run Actor" to execute the actor with your inputs
   - The application will poll for results and display them when ready

5. **View Results**:
   - Results are displayed in JSON format
   - For large results, you may need to scroll through the output

## Actors used for Testing

The following actors work well with this demo application:

- **lukaskrivka/open-source-actors-scraper**: Scrapes information about open-source actors from the Apify platform

- **apify/google-search-scraper**: Scrapes Google search results


## Design Decisions

### Architecture

- **Backend**: Node.js with Express for API routing and proxy to Apify API
- **Frontend**: Vanilla JavaScript for simplicity and minimal dependencies
- **API Communication**: Axios for HTTP requests on the backend

### User Experience

- Progressive disclosure of UI elements based on the current step
- Clear status messages for all operations
- Responsive design that works on both desktop and mobile devices

### Security Considerations

- API keys are never stored in local storage or cookies
- Keys are only kept in memory during the session
- All API requests are proxied through the backend to avoid exposing the API key in frontend code

### Error Handling

- Comprehensive error handling for API requests
- User-friendly error messages
- Polling mechanism with timeout for long-running actor executions

## Application Workflow

### 1. Authentication
- Open the application at http://localhost:3000
- Enter your Apify API key in the input field
- Click the "Validate" button
- Upon successful validation, you'll see a green success message
- The Actor Selection section will become available

### 2. Actor Selection
- Browse the dropdown menu to see available actors
- Select an actor from the list
- The actor's name and description will appear below the dropdown
- The Input Configuration section will become available

### 3. Input Configuration
- The form will dynamically generate based on the actor's input schema
- Different input types will be presented appropriately:
  - Text fields for strings
  - Checkboxes for booleans
  - Number inputs for numeric values
  - Expandable sections for objects and arrays
- Required fields are marked with an asterisk (*)
- Fill in at least all required fields

### 4. Actor Execution
- Click the "Run Actor" button to execute with your inputs
- A loading spinner will appear while the actor is running
- Status updates will be displayed during execution

### 5. Results Display
- Once complete, results will appear in the Results section
- JSON output is formatted for readability
- Use the "Copy Results" button to copy the output to clipboard
- For large results, scroll through the output area



