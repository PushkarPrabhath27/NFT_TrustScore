1
---

### **Detailed Prompt for Integrating Backend Analysis with Frontend**

---

**Objective:**  
The objective is to create a seamless integration between the **frontend** and the **backend** so that when a user provides an **NFT contract address**, the frontend communicates with the backend to fetch real-time analysis data. The frontend will then display this data in a **clean, user-friendly** interface. **No mock data** should be shown at any point, unless there is a clear failure in fetching the data from the backend.

---

### **Step 1: User Input and Request to Backend**
- **User Input**:  
  The user will input an **NFT contract address** in a text field provided in the frontend.
  
  - The address should be captured and used to initiate a **request to the backend** to fetch detailed NFT analysis data.
  - Upon submission, the frontend will make a request to the backend, passing the contract address as a parameter.
  
- **Backend Request**:  
  The frontend will **send a request** to the backend with the contract address. The backend will then process the address and return detailed data, including the analysis.

---

### **Step 2: Backend Processing and Response**
- **Backend Processing**:  
  The backend is responsible for receiving the contract address and returning an **analysis report**. This includes detailed data such as:
  
  1. **NFT Information**: Name, image, blockchain, creator, trust score, etc.
  2. **Price Data**: Current price, historical trends, predicted price, and comparisons to similar collections.
  3. **Risk Data**: Contract risk, market volatility, creator risk, liquidity risk, etc.
  4. **Fraud Data**: Fraud score, wash trading, metadata authenticity, etc.
  5. **Creator Data**: Creator’s address, trust score, verification status, and history.
  
  The backend will process this data and return it in a **structured JSON format** to the frontend.

- **Error Handling**:  
  If the backend is unable to process the address (due to an invalid address, server error, or other issues), it should return an **error response**. The frontend should handle this case and **display a meaningful error message** instead of using mock data.

---

### **Step 3: Frontend Handling and Display of Data**
- **Receiving the Data**:  
  Once the frontend receives the data from the backend, it should **process** this information and display it on the page.
  
  - The **data should be parsed** properly, extracting the relevant details such as NFT name, price, trust score, and other important metrics.
  - The frontend should **only show the real data** fetched from the backend and **not fallback to mock data** unless there is an error in fetching the data.

- **Displaying Data**:  
  The frontend will use a **dynamic display system** to show the following details:

  1. **NFT Information**: Display the NFT’s name, image, blockchain, creator, trust score, and other important details.
  2. **Price Data**: Present the current price, historical price trends, predicted price, and price comparisons with similar collections.
  3. **Risk Analysis**: Show the overall risk level and breakdown of specific risks (contract vulnerability, market volatility, etc.).
  4. **Fraud Data**: Display the fraud score along with any relevant fraud indicators (e.g., wash trading, metadata issues).
  5. **Creator Data**: Provide the creator’s information, including their trust score and verification status.

- **User Feedback**:  
  The frontend should ensure **clear communication with the user**. If an error occurs, display a message like:
  - “Sorry, we couldn’t fetch the analysis for this contract address. Please check the address or try again later.”
  
  If the analysis is successfully fetched, display the data in **interactive charts**, tables, or other visually appealing components.

---

### **Step 4: Error Handling**
- **Error Scenarios**:
  1. **Invalid Contract Address**:  
     If the user enters an invalid contract address or the backend cannot process it, the frontend should show a clear error message.
  
  2. **API Failure**:  
     If the API call to the backend fails due to network issues, server errors, or other reasons, display an appropriate error message.
  
  3. **Backend Returns No Data**:  
     If the backend responds with **empty data** or an invalid response, show a message like:
     - “No analysis data available for this contract address.”

---

### **Step 5: Frontend User Interface Design**
- **Input Field**:
  - Provide an **input box** for the user to enter the **NFT contract address**.
  - There should be a **submit button** that triggers the request to the backend once the user enters the address.

- **Loading State**:  
  While the data is being fetched, show a **loading spinner** or a message like “Fetching analysis data...”. This will let the user know the data is being retrieved and the process may take some time.

- **Data Presentation**:  
  Once the backend sends the analysis data, present it in a **well-structured layout**. Use **cards, tables, or interactive charts** to represent the data in a visually digestible manner:
  
  - **NFT Information**: Show the name, image, blockchain, creator address, trust score, and risk level.
  - **Price Data**: Display current price, historical price trends, and comparison with similar collections.
  - **Risk Analysis**: Visualize contract risk, market volatility, and creator risk using **bar charts** or **risk meters**.
  - **Fraud Data**: Present fraud indicators and score in a **warning/alert style**.
  - **Creator Data**: List the creator’s information and trust score in a **simple, clean format**.

- **Error Display**:  
  If an error occurs (e.g., failure in fetching data), display the error in a **user-friendly manner**, guiding the user to either retry or check the contract address.

---

### **Step 6: Testing and Debugging**
- **Frontend Testing**:  
  Test the frontend to ensure that:
  - It correctly handles inputs and sends requests to the backend.
  - It displays the data fetched from the backend accurately, without fallback to mock data.
  - It shows loading states while waiting for the backend response.
  - It handles errors gracefully and provides clear error messages when needed.

- **Backend Testing**:  
  Ensure the backend is:
  - Properly processing the contract address.
  - Returning the correct and complete analysis data.
  - Returning appropriate error messages or codes when the contract address cannot be analyzed or if there are server issues.

---

### **Step 7: Final Deployment**
- **Frontend Deployment**:  
  Deploy the frontend application and ensure it is **connected** to the correct backend API endpoint. Verify the **end-to-end** process from entering the contract address to displaying the fetched analysis.

- **Backend Deployment**:  
  Ensure that the backend is **available and reliable**, and that the API can handle real-time requests without failure.

---

**Summary of Key Points**:
- The **frontend must always use live data from the backend** for the NFT analysis, and **mock data should never be shown** unless the backend fails.
- A **clear error handling mechanism** is necessary to inform users when things go wrong.
- The **user interface** should present data in an organized, visually appealing way, offering a smooth experience for the user.
