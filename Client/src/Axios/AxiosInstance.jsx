import React from 'react'
import axios from "axios"
const AxiosInstance = axios.create({
    baseURL:"https://cloth-printing.onrender.com",
    withCredentials: true,
     headers: {
    "Content-Type": "application/json",
  },
})

export default AxiosInstance
