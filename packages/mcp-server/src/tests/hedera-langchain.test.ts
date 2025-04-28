// import { describe, it, expect, vi, beforeEach } from 'vitest';
// import {handleHederaInteraction} from "../modules/hedera-langchain.js";
//
// // Mock the global fetch function
// global.fetch = vi.fn();
//
// // Store the original process.env
// const originalEnv = { ...process.env };
//
// describe('handleHederaInteraction', () => {
//   const mockApiUrl = 'http://localhost:3000/interact-with-hedera';
//   const testPrompt = 'test prompt';
//
//   beforeEach(() => {
//     vi.resetAllMocks();
//     // Reset process.env before each test
//     process.env = { ...originalEnv };
//     // Set the token for tests
//     process.env.LANGCHAIN_PROXY_TOKEN = 'some-token';
//   });
//
//   it('should return success response when API call is successful', async () => {
//     const mockResponseText = 'some data'
//     const mockResponseData = { success: true, data: mockResponseText };
//     (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
//       ok: true,
//       json: async () => mockResponseData,
//       status: 200
//     });
//
//     const result = await handleHederaInteraction(testPrompt, mockApiUrl);
//
//     expect(fetch).toHaveBeenCalledTimes(1);
//     expect(fetch).toHaveBeenCalledWith(mockApiUrl, {
//       method: 'POST',
//       body: JSON.stringify({
//         fullPrompt: testPrompt
//       }),
//       headers: {
//         'Content-Type': 'application/json',
//         'X-LANGCHAIN-PROXY-TOKEN': process.env.LANGCHAIN_PROXY_TOKEN,
//         'X-CUSTODIAL-MODE': 'false'
//       },
//     });
//     expect(result).include(mockResponseText);
//   });
//
//   it('should return error response when API call fails', async () => {
//     const mockErrorText = 'Internal Server Error';
//     (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
//       ok: false,
//       status: 500,
//       text: async () => mockErrorText,
//     });
//
//     const result = await handleHederaInteraction(testPrompt, mockApiUrl);
//
//     expect(fetch).toHaveBeenCalledTimes(1);
//     expect(fetch).toHaveBeenCalledWith(mockApiUrl, {
//       method: 'POST',
//       body: JSON.stringify({
//         fullPrompt: testPrompt
//       }),
//       headers: {
//         'Content-Type': 'application/json',
//         "X-CUSTODIAL-MODE": "false",
//         'X-LANGCHAIN-PROXY-TOKEN': 'some-token'
//       },
//     });
//     expect(result).toContain('An error occurred while interacting with Hedera:');
//     expect(result).toContain('API request failed with status 500');
//     expect(result).toContain(mockErrorText);
//   });
//
//   it('should return error response when fetch throws an error', async () => {
//     const mockError = new Error('Network error');
//     (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);
//
//     const result = await handleHederaInteraction(testPrompt, mockApiUrl);
//
//     expect(fetch).toHaveBeenCalledTimes(1);
//     expect(result).toBe(`An error occurred while interacting with Hedera: ${mockError.toString()}`);
//   });
//
//   it('should return error response when API_URL is not provided', async () => {
//     const result = await handleHederaInteraction(testPrompt, undefined);
//
//     expect(fetch).not.toHaveBeenCalled();
//     expect(result).toBe('API_URL environment variable is not set.');
//   });
//
//   it('should handle empty LANGCHAIN_PROXY_TOKEN', async () => {
//     // Set token to undefined for this test
//     delete process.env.LANGCHAIN_PROXY_TOKEN;
//
//     const mockResponseData = { success: true, data: 'some data' };
//     (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
//       ok: true,
//       json: async () => mockResponseData,
//       status: 200
//     });
//
//     const result = await handleHederaInteraction(testPrompt, mockApiUrl);
//
//     expect(fetch).toHaveBeenCalledWith(mockApiUrl, {
//       method: 'POST',
//       body: JSON.stringify({
//         fullPrompt: testPrompt
//       }),
//       headers: {
//         'Content-Type': 'application/json',
//         "X-CUSTODIAL-MODE": "false",
//         'X-LANGCHAIN-PROXY-TOKEN': ''  // Should send empty string when token is undefined
//       },
//     });
//
//     console.log(result, typeof result)
//     console.log(mockResponseData.data, typeof mockResponseData.data)
//     expect(result).include(mockResponseData.data);
//   });
// });