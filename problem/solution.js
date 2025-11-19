/**
 * Example solution for "Valid Palindrome II"
 *
 * This is a correct implementation that passes all test cases.
 * The function must be named "solution" to work with the test runner.
 */

function solution(s) {
  // Helper function to check if a substring is a palindrome
  function isPalindrome(str, left, right) {
    while (left < right) {
      if (str[left] !== str[right]) {
        return false;
      }
      left++;
      right--;
    }
    return true;
  }

  let left = 0;
  let right = s.length - 1;

  while (left < right) {
    if (s[left] !== s[right]) {
      // Try deleting left character or right character
      return (
        isPalindrome(s, left + 1, right) || isPalindrome(s, left, right - 1)
      );
    }
    left++;
    right--;
  }

  // String is already a palindrome
  return true;
}
