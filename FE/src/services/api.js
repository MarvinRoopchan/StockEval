const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export async function requestValuation(ticker) {
  try {
    const response = await fetch(`${API_URL}/api/v1/valuations/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ticker }),
    });

    if (!response.ok) {
      throw new ApiError(
        `Failed to request valuation: ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error: Unable to request valuation', 0);
  }
}

export async function checkValuationStatus(jobId) {
  try {
    const response = await fetch(`${API_URL}/api/v1/valuations/${jobId}`);

    if (!response.ok) {
      throw new ApiError(
        `Failed to check valuation status: ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error: Unable to check valuation status', 0);
  }
}

export async function getLatestPrice(ticker) {
  try {
    const response = await fetch(`${API_URL}/api/v1/prices/${ticker}/latest/`);

    if (!response.ok) {
      throw new ApiError(
        `Failed to get latest price: ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error: Unable to get latest price', 0);
  }
}