import { Problem } from "@/types/problem";
import { Test } from "@/types/test";

export const problems: Problem[] = [
  {
    id: 1,
    title: "Two Sum",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    marks: 10,
    difficulty: "Easy",
    type: "coding",
    questionType: "Coding",
    inputFormat: "An array of integers and an integer target",
    outputFormat: "An array of two indices",
    constraints: "2 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9",
    boilerplateCode: {
      javascript: "function twoSum(nums, target) {\n  // Your code here\n}",
      python: "def two_sum(nums, target):\n        # Your code here\n    pass",
    },
  },
  {
    id: 2,
    title: "Binary Search Implementation",
    description:
      "Implement binary search algorithm to find a target value in a sorted array. Return the index if found, -1 otherwise.",
    marks: 15,
    difficulty: "Medium",
    type: "coding",
    questionType: "Coding",
    inputFormat: "A sorted array of integers and an integer target",
    outputFormat: "An integer index or -1",
    constraints: "1 <= nums.length <= 10^5",
    boilerplateCode: {
      javascript:
        "function binarySearch(nums, target) {\n  // Your code here\n}",
      python:
        "def binary_search(nums, target):\n    # Your code here\n    pass",
    },
  },
  {
    id: 3,
    title: "JavaScript Closures",
    description:
      "Which of the following best describes a closure in JavaScript?",
    marks: 5,
    difficulty: "Easy",
    type: "mcq",
    questionType: "Single Correct",
    options: [
      "A function having access to its outer function scope even after the outer function has returned",
      "A function with no parameters",
      "A function that calls itself",
    ],
    correctAnswer: "a",
  },
  {
    id: 4,
    title: "Longest Palindromic Substring",
    description:
      "Given a string s, return the longest palindromic substring in s. A palindrome reads the same backward as forward.",
    marks: 25,
    difficulty: "Hard",
    type: "coding",
    questionType: "Coding",
    inputFormat: "A string s",
    outputFormat: "A string which is the longest palindrome",
    constraints: "1 <= s.length <= 1000",
    boilerplateCode: {
      javascript: "function longestPalindrome(s) {\n  // Your code here\n}",
      python: "def longest_palindrome(s):\n    # Your code here\n    pass",
    },
  },
  {
    id: 5,
    title: "React State Management",
    description:
      "What is the correct way to update state in a React functional component?",
    marks: 8,
    difficulty: "Medium",
    type: "mcq",
    questionType: "Multiple Correct",
    options: [
      "Directly assign a new value to the state variable",
      "Use setState with a new value",
      "Use the useState setter function",
    ],
    correctAnswer: "c,a",
  },
  {
    id: 6,
    title: "Merge Sort Algorithm",
    description:
      "Implement the merge sort algorithm to sort an array of integers in ascending order.",
    marks: 20,
    difficulty: "Medium",
    type: "coding",
    questionType: "Coding",
    inputFormat: "An array of integers",
    outputFormat: "A sorted array in ascending order",
    constraints: "1 <= nums.length <= 10^5",
    boilerplateCode: {
      javascript: "function mergeSort(nums) {\n  // Your code here\n}",
      python: "def merge_sort(nums):\n    # Your code here\n    pass",
    },
  },
  {
    id: 7,
    title: "Database Normalization",
    description: "Which normal form eliminates transitive dependencies?",
    marks: 12,
    difficulty: "Hard",
    type: "mcq",
    questionType: "Single Correct",
    options: [
      "1NF",
      "2NF",
      "3NF",
      "BCNF",
    ],
    correctAnswer: "c",
  },
  {
    id: 8,
    title: "Valid Parentheses",
    description:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    marks: 10,
    difficulty: "Easy",
    type: "coding",
    questionType: "Coding",
    inputFormat: "A string containing parentheses",
    outputFormat: "Boolean indicating validity",
    constraints: "1 <= s.length <= 10^4",
    boilerplateCode: {
      javascript: "function isValid(s) {\n  // Your code here\n}",
      python: "def is_valid(s):\n    # Your code here\n    pass",
    },
  },
  {
    id: 9,
    title: "Big O Notation",
    description:
      "What is the time complexity of searching for an element in a balanced binary search tree?",
    marks: 6,
    difficulty: "Easy",
    type: "mcq",
    questionType: "Single Correct",
    options: [
      "O(n)",
      "O(log n)",
      "O(1)",
    ],
    correctAnswer: "b",
  },
  {
    id: 10,
    title: "Graph Shortest Path",
    description:
      "Implement Dijkstra's algorithm to find the shortest path between two nodes in a weighted graph.",
    marks: 30,
    difficulty: "Hard",
    type: "coding",
    questionType: "Coding",
    inputFormat: "A graph as an adjacency list and a source node",
    outputFormat: "An array of shortest distances from source",
    constraints: "Graph contains no negative weight edges",
    boilerplateCode: {
      javascript: "function dijkstra(graph, source) {\n  // Your code here\n}",
      python: "def dijkstra(graph, source):\n    # Your code here\n    pass",
    },
  },
  {
    id: 11,
    title: "Sum of Two Numbers",
    description: "Given two numbers, return their sum.",
    type: "coding",
    questionType: "Coding",
    difficulty: "Easy",
    inputFormat: "Two integers a and b",
    outputFormat: "An integer representing their sum",
    constraints: "1 <= a, b <= 10^9",
    boilerplateCode: {
      javascript: "function sum(a, b) {\n  // Your code here\n}",
      python: "def sum(a, b):\n    # Your code here\n    pass",
    },
    marks: 10,
  },
  {
    id: 12,
    title: "What is the output of 2 + 2?",
    description: "Select the correct answer.",
    type: "mcq",
    difficulty: "Easy",
    questionType: "Single Correct",
    options: [
      "3",
      "4",
      "5",
    ],
    correctAnswer: "b",
    marks: 5,
  },
];

export function getQuestionById(id: number) {
  return problems.find((problem) => problem.id === id) ?? null;
}

export const testsData: Test[] = [
  {
    id: "1",
    title: "JavaScript Fundamentals",
    description: "Basic JavaScript concepts and syntax",
    duration: "01:00:00",
    totalQuestions: 10,
    participantsInProgress: 8,
    participantsCompleted: 12,
    status: "ongoing",
    joinId: "mock-join-1",
    startsAt: "2025-07-10 10:00 AM",
    createdAt: "2025-07-01T10:00:00Z",
    problems: [],
  },
  {
    id: "2",

    title: "Assessment Results",
    description: "Performance summary for this assessment.",
    duration: "01:30:00",
    totalQuestions: 15,
    participantsInProgress: 0,
    participantsCompleted: 0,
    status: "waiting",
    joinId: "mock-join-2",
    startsAt: "2025-07-12 11:30 AM",
    createdAt: "2025-07-05T10:00:00Z",
    problems: [2, 3, 6, 8, 10, 12],
    participants: [
      {
        userId: "user_1",
        name: "Deepthi",
        score: 85,
        status: "PASSED",
        submittedAt: "2025-07-12T14:30:00Z",
      },
      {
        userId: "user_2",
        name: "Adithya",
        score: 45,
        status: "FAILED",
        submittedAt: "2025-07-12T15:00:00Z",
      },
      {
        userId: "user_3",
        name: "Rahul",
        score: 92,
        status: "PASSED",
        submittedAt: "2025-07-12T14:45:00Z",
      }
    ]
  },
  {
    id: "3",
    title: "Database Design",
    description: "SQL and database modeling concepts",
    duration: "02:00:00",
    totalQuestions: 20,
    participantsInProgress: 0,
    participantsCompleted: 32,
    status: "completed",
    joinId: "mock-join-3",
    startsAt: "2025-07-08 09:00 AM",
    createdAt: "2025-07-01T09:00:00Z",
    problems: [1, 3, 4, 6, 7, 8, 11],
  },
  {
    id: "4",
    title: "Python Basics",
    description: "Introduction to Python programming",
    duration: "01:15:00",
    totalQuestions: 12,
    participantsInProgress: 7,
    participantsCompleted: 15,
    status: "ongoing",
    joinId: "mock-join-4",
    startsAt: "2025-07-15 02:00 PM",
    createdAt: "2025-07-10T10:00:00Z",
    problems: [2, 5, 6, 9, 10],
  },
  {
    id: "5",
    title: "Data Structures",
    description: "Arrays, linked lists, stacks, and queues",
    duration: "01:45:00",
    totalQuestions: 18,
    participantsInProgress: 10,
    participantsCompleted: 18,
    status: "completed",
    joinId: "mock-join-5",
    startsAt: "2025-07-05 01:30 PM",
    createdAt: "2025-06-28T10:00:00Z",
    problems: [1, 3, 4, 7, 8, 9, 11, 12],
  },
];

// Helper function to get all tests
export const getAllTests = (): Test[] => {
  return testsData;
};

// Helper function to get a test by ID
export const getTestById = (id: string): Test | undefined => {
  return testsData.find((test) => test.id === id);
};

// Helper function to get tests by status
export const getTestsByStatus = (status: Test["status"]): Test[] => {
  return testsData.filter((test) => test.status === status);
};
