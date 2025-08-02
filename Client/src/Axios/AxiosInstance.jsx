import React from 'react'
import axios from "axios"
const AxiosInstance = axios.create({
    baseURL:import.meta.env.BACKEND_URI ||"http://localhost:5000",
    withCredentials: true,
     headers: {
    "Content-Type": "application/json",
  },
})

export default AxiosInstance
