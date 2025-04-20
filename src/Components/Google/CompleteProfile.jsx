"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import styled from "styled-components"
import { FaPhone, FaCalendarAlt, FaGlobe, FaMapMarkerAlt, FaUser, FaHashtag } from "react-icons/fa"
import Swal from "sweetalert2"
import { GraphQLClient, gql } from "graphql-request"
import "./CompleteProfile.css";


const client = new GraphQLClient("http://localhost:4000/graphql")
const GET_COUNTRIES_QUERY = gql`
  query {
    getCountries {
      _id
      name
      phone_code
    }
  }
`

const CompleteProfile = () => {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const mode = params.get("mode")
  const navigate = useNavigate()

  const [countries, setCountries] = useState([])
  const [formData, setFormData] = useState({
    phoneNumber: "",
    phoneCode: "",
    birthDate: "",
    country: "",
    address: "",
    age: "",
    pin: "", // ✅ nuevo campo PIN
  })

  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState("")
  const [userName, setUserName] = useState("")

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const userToken = urlParams.get("token")

    if (!userToken) {
      Swal.fire({ title: "Error", text: "No token provided", icon: "error", confirmButtonColor: "#ff4b2b" })
      return navigate("/")
    }

    setToken(userToken)

    const fetchUserInfo = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${userToken}` },
        })

        if (response.ok) {
          const userData = await response.json()
          setUserName(userData.name || "User")

          setFormData((prev) => ({
            ...prev,
            country: userData.country || "",
            address: userData.address || "",
            birthDate: userData.birthDate ? userData.birthDate.slice(0, 10) : "",
            phoneNumber: userData.phone || "",
            age: userData.age || "",
            pin: userData.pin || "", // Prellenar si ya tenía uno
          }))
        }
      } catch (error) {
        console.error("Error fetching user info:", error)
      }
    }

    const fetchCountries = async () => {
      try {
        const data = await client.request(GET_COUNTRIES_QUERY)
        setCountries(data.getCountries)
      } catch (error) {
        console.error("Error fetching countries:", error)
      }
    }

    fetchUserInfo()
    fetchCountries()
  }, [navigate])

  useEffect(() => {
    const verify = params.get("verify")
    if (verify === "google") {
      Swal.fire({
        icon: "info",
        title: "Verification Email Sent",
        text: "Please check your email to verify your account before signing in.",
        confirmButtonColor: "#ff4b2b",
      })
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === "country") {
      const selected = countries.find((c) => c.name === value)
      setFormData((prev) => ({
        ...prev,
        country: value,
        phoneCode: selected?.phone_code || "",
      }))
    } else if (name === "birthDate") {
      const birthDate = new Date(value)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const m = today.getMonth() - birthDate.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      setFormData((prev) => ({
        ...prev,
        birthDate: value,
        age: age.toString(),
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const fullPhone = `${formData.phoneCode} ${formData.phoneNumber}`.trim()

    try {
      const response = await fetch("http://localhost:5000/api/users/complete-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          phone: fullPhone,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        Swal.fire({
          title: "Success!",
          text: "Your profile has been completed successfully. A verification email has also been sent.",
          icon: "success",
          confirmButtonColor: "#ff4b2b",
        })
        localStorage.setItem("token", token)

        if (mode === "signin") {
          navigate("/", { state: { openLogin: true } })
        } else {
          navigate("/profile-selector")
        }
      } else {
        throw new Error(data.message || "Failed to complete profile")
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
        confirmButtonColor: "#ff4b2b",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="complete-profile-container">
      <div className="profile-card">
        <div className="profile-image"><FaUser /></div>
        <h1 className="profile-title">Complete Your Profile</h1>
        <p className="profile-subtitle">
          Welcome{userName ? `, ${userName}` : ""}! Please provide a few more details to complete your profile.
        </p>
  
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="input-container">
            <span className="input-icon"><FaGlobe /></span>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              className="profile-select"
            >
              <option value="">Select your country</option>
              {countries.map((country) => (
                <option key={country._id} value={country.name}>{country.name}</option>
              ))}
            </select>
          </div>
  
          <div className="phone-wrapper">
            <div className="phone-code">{formData.phoneCode || ""}</div>
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              className="profile-input"
            />
          </div>
  
          <div className="input-container">
            <span className="input-icon"><FaMapMarkerAlt /></span>
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              required
              className="profile-input"
            />
          </div>
  
          <div className="input-container">
            <span className="input-icon"><FaCalendarAlt /></span>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              required
              className="profile-input"
            />
          </div>
  
          <div className="input-container">
            <span className="input-icon"><FaHashtag /></span>
            <input
              type="number"
              name="age"
              placeholder="Age"
              value={formData.age}
              onChange={handleChange}
              required
              className="profile-input"
            />
          </div>
  
          <div className="input-container">
            <span className="input-icon"><FaHashtag /></span>
            <input
              type="text"
              name="pin"
              placeholder="PIN (6 digits)"
              value={formData.pin}
              onChange={handleChange}
              maxLength={6}
              pattern="\d{6}"
              required
              className="profile-input"
            />
          </div>
  
          <button type="submit" className="profile-button" disabled={loading}>
            {loading ? "Processing..." : "Complete Profile"}
          </button>
        </form>
      </div>
    </div>
  )
  
}

export default CompleteProfile
