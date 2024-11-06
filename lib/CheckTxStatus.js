
/*const axios = require("axios");
const { MOONBASE_ALPHA, MOONBEAM } = require("../constants");

const checkTxStatus = async (txId) => {
  try {
    const requestData = {
      jsonrpc: "2.0",
      id: 1,
      method: "moon_isTxFinalized",
      params: [txId],
    };

    // POST request to Moonbeam RPC endpoint
    const response = await axios.post(MOONBASE_ALPHA, requestData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response?.status === 200) {
      const { result } = response.data;
      console.log("the on-chain result", result)

      // Return "YES" if transaction is finalized, otherwise "NO"
      console.log("tx status", response.status)
      return result === true ? "SUCCESS" : "FAILED";
    } else {
      // In case the API returns an unexpected status code
      console.log("failed status", response.status)
      return "FAILED";
    }
  } catch (error) {
    console.error("Error checking transaction status:", error);
    return "FAILED";
  }
};

module.exports = { checkTxStatus };*/

const axios = require("axios");
const { MOONBASE_ALPHA, MOONBEAM } = require("../constants");

// Retry configuration
const MAX_RETRIES = 50;  // Number of times to retry before giving up
const RETRY_DELAY = 10000;  // Delay between retries (in milliseconds)

const checkTxStatus = async (txId) => {
  console.log("transaction hash from checker", txId)
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const requestData = {
        jsonrpc: "2.0",
        id: 1,
        method: "moon_isTxFinalized",
        params: [txId],
      };

      // POST request to Moonbeam RPC endpoint
      const response = await axios.post(MOONBASE_ALPHA, requestData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response?.status === 200) {
        const { result } = response.data;
        console.log("On-chain result:", result);
        console.log(`Attempt ${attempt}: Transaction status`, response.status);

        // Return "SUCCESS" if transaction is finalized, otherwise retry
        if (result === true) {
          return "SUCCESS";
        }
      } else {
        console.log(`Attempt ${attempt}: Failed status ${response.status}`);
      }
    } catch (error) {
      console.error(`Attempt ${attempt}: Error checking transaction status:`, error);
    }

    // Wait for the specified delay before the next retry
    console.log(`Waiting for ${RETRY_DELAY / 1000} seconds before retrying...`);
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
  }

  // If all retries fail, return "FAILED"
  return "FAILED";
};

const KLASTER_EXPLORE = "https://klaster-node.polycode.sh/v2/explorer/"
// Function to fetch transaction details and get the last UserOps executionStatus
/*const checkItxStatus = async (txHash) => {
  try {
    const res = await axios.get(`${KLASTER_EXPLORE}${txHash}`);
    console.log('response', res)
    const userOps = res.data.userOps;
    
    // Check if userOps array exists and has entries
    if (userOps && userOps.length > 0) {
      const lastUserOp = userOps[userOps.length - 1]; // Get the last UserOps entry
      return lastUserOp.executionStatus; // Return the executionStatus of the last UserOps entry
    } else {
      console.log("No UserOps found in response");
      return "PENDING"; // Default to pending if no UserOps are found
    }
  } catch (error) {
    console.log("Klaster something went wrong", error);
    return "ERROR"; // Return an error status to handle in the monitoring function
  }
};*/

// Function to fetch transaction details and check all UserOps statuses
const checkItxStatus = async (txHash) => {
  try {
    const res = await axios.get(`${KLASTER_EXPLORE}${txHash}`);
      console.log("respnse", res)
    // Check if the response status code is 400
    if (res.status === 400) {
      console.error("Error 400: Bad request to Klaster API");
      return "ERROR";
    }

    const userOps = res.data.userOps;

    // Ensure userOps array exists and has entries
    if (userOps && userOps.length > 0) {
      // Check if all userOps have an executionStatus of SUCCESS
      const allSuccess = userOps.every(op => op.executionStatus === "SUCCESS");

      return allSuccess ? "SUCCESS" : "PENDING"; // Return success only if all are successful
    } else {
      console.log("No UserOps found in response");
      return "PENDING"; // Default to pending if no UserOps are found
    }
  } catch (error) {
    console.error("Klaster API error:", error);
    return "ERROR"; // Return an error status if there was an exception
  }
}
module.exports = { checkTxStatus , checkItxStatus};

