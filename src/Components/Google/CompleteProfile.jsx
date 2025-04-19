"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import styled from "styled-components"
import { FaPhone, FaCalendarAlt, FaGlobe, FaMapMarkerAlt, FaUser, FaHashtag } from "react-icons/fa"
import Swal from "sweetalert2"
import { GraphQLClient, gql } from "graphql-request"

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

const CompleteProfileContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f6f5f7;
  padding: 20px;
`

const ProfileCard = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
  width: 100%;
  max-width: 500px;
  padding: 40px;
  text-align: center;
`

const Title = styled.h1`
  font-weight: bold;
  font-size: 28px;
  color: #333;
  margin-bottom: 30px;
`

const Subtitle = styled.p`
  color: #666;
  font-size: 16px;
  margin-bottom: 30px;
  line-height: 1.5;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`

const Icon = styled.span`
  position: absolute;
  left: 15px;
  display: flex;
  align-items: center;
  color: #ccc;
`

const Input = styled.input`
  width: 100%;
  padding: 15px 15px 15px 45px;
  border: 1px solid #ddd;
  border-radius: 25px;
  font-size: 16px;
  transition: all 0.3s ease;
  &:focus {
    outline: none;
    border-color: #ff4b2b;
    box-shadow: 0 0 0 2px rgba(255, 75, 43, 0.1);
  }
`

const Select = styled.select`
  width: 100%;
  padding: 15px 15px 15px 45px;
  border: 1px solid #ddd;
  border-radius: 25px;
  font-size: 16px;
  appearance: none;
  background-position: right 15px top 50%;
  background-size: 12px auto;
  transition: all 0.3s ease;
  &:focus {
    outline: none;
    border-color: #ff4b2b;
    box-shadow: 0 0 0 2px rgba(255, 75, 43, 0.1);
  }
`

const PhoneWrapper = styled.div`
  display: flex;
  gap: 10px;
`

const PhoneCode = styled.div`
  width: 80px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 25px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Button = styled.button`
  padding: 15px 0;
  background-color: #ff4b2b;
  color: white;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
  margin-top: 10px;
  &:hover {
    background-color: #e04322;
  }
  &:active {
    transform: scale(0.98);
  }
  &:focus {
    outline: none;
  }
`

const ProfileImage = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 30px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  svg {
    font-size: 40px;
    color: #ff4b2b;
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
    <CompleteProfileContainer>
      <ProfileCard>
        <ProfileImage><FaUser /></ProfileImage>
        <Title>Complete Your Profile</Title>
        <Subtitle>Welcome{userName ? `, ${userName}` : ""}! Please provide a few more details to complete your profile.</Subtitle>

        <Form onSubmit={handleSubmit}>
          <InputContainer>
            <Icon><FaGlobe /></Icon>
            <Select name="country" value={formData.country} onChange={handleChange} required>
              <option value="">Select your country</option>
              {countries.map((country) => (
                <option key={country._id} value={country.name}>{country.name}</option>
              ))}
            </Select>
          </InputContainer>

          <PhoneWrapper>
            <PhoneCode>{formData.phoneCode || ""}</PhoneCode>
            <Input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </PhoneWrapper>

          <InputContainer>
            <Icon><FaMapMarkerAlt /></Icon>
            <Input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </InputContainer>

          <InputContainer>
            <Icon><FaCalendarAlt /></Icon>
            <Input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              required
            />
          </InputContainer>

          <InputContainer>
            <Icon><FaHashtag /></Icon>
            <Input
              type="number"
              name="age"
              placeholder="Age"
              value={formData.age}
              onChange={handleChange}
              required
            />
          </InputContainer>

          <InputContainer>
            <Icon><FaHashtag /></Icon>
            <Input
              type="text"
              name="pin"
              placeholder="PIN (6 digits)"
              value={formData.pin}
              onChange={handleChange}
              maxLength={6}
              pattern="\d{6}"
              required
            />
          </InputContainer>

          <Button type="submit" disabled={loading}>
            {loading ? "Processing..." : "Complete Profile"}
          </Button>
        </Form>
      </ProfileCard>
    </CompleteProfileContainer>
  )
}

export default CompleteProfile
