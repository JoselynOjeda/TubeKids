"use client"

import { useState, useEffect, useRef } from "react"
import styled, { keyframes } from "styled-components" // Añadido import de styled
import * as Components from "./AuthenticationStyles"
import { FaEnvelope, FaLock, FaUser, FaIdBadge, FaGlobe, FaCalendarAlt, FaTimes, FaGoogle } from "react-icons/fa"
import Swal from "sweetalert2"
import { useNavigate } from "react-router-dom"

import { GraphQLClient, gql } from "graphql-request"

// Estilos adicionales para el popup
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

const slideIn = keyframes`
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease;
`

const ModalContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
  animation: ${slideIn} 0.3s ease;
`

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  color: #666;
  cursor: pointer;
  z-index: 10;
  
  &:hover {
    color: #ff4b2b;
  }
`

// Estilos para el contenedor de teléfono que mantiene el mismo diseño
const PhoneInputWrapper = styled.div`
  display: flex;
  width: 100%;
  gap: 10px;
`

const PhoneCodeField = styled.div`
  display: flex;
  align-items: center;
  width: 80px;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0 10px;
  color: #333;
  background-color: #fff;
`

const PhoneNumberField = styled(Components.Input)`
  flex: 1;
`

// Estilo para el botón de Google
const GoogleButton = styled.button`
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: #fff;
  color: #757575;
  border: 1px solid #ddd;
  border-radius: 25px;
  padding: 12px 0;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  width: 70%;
  margin: 10px auto;
  transition: background-color 0.3s, box-shadow 0.3s;

  &:hover {
    background-color: #f5f5f5;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  svg {
    color: #4285F4;
    font-size: 20px;
  }
`

const OrDivider = styled.div`
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  margin: 15px 0;
  color: #757575;
  font-size: 14px;

  &::before,
  &::after {
    content: "";
    flex: 1;
    border-bottom: 1px solid #ddd;
  }

  &::before {
    margin-right: 10px;
  }

  &::after {
    margin-left: 10px;
  }
`

const client = new GraphQLClient("http://localhost:4000/graphql")
const GET_COUNTRIES_QUERY = gql`
  query {
    getCountries {
      _id
      name
      code
      phone_code
    }
  }
`

const API_URL = "http://localhost:5000/api/users/"

const initialState = {
  email: "",
  password: "",
  confirmPassword: "",
  phoneCode: "",
  phoneNumber: "",
  phone: "",
  pin: "",
  name: "",
  surname: "",
  country: "",
  birthDate: "",
}

const VerificationPopup = ({
  showVerificationPopup,
  goBackFromVerification,
  verificationCode,
  handleCodeChange,
  handleCodeKeyDown,
  handleCodePaste,
  isVerifying,
  inputRefs,
  verificationError,
  verificationSuccess,
  canResend,
  handleResendCode,
  resendTimer,
  verifyCode,
}) => {
  if (!showVerificationPopup) return null

  return (
    <ModalOverlay>
      <ModalContainer>
        <CloseButton onClick={goBackFromVerification}>
          <FaTimes />
        </CloseButton>
        <Components.VerificationContainer>
          <Components.Title>Verification Code</Components.Title>
          <Components.Paragraph>
            We've sent a 6-digit code to your phone. Enter it below to verify your account.
          </Components.Paragraph>

          <Components.CodeInputContainer>
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <Components.CodeInput
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={verificationCode[index]}
                onChange={(e) => handleCodeChange(e, index)}
                onKeyDown={(e) => handleCodeKeyDown(e, index)}
                onPaste={handleCodePaste}
                disabled={isVerifying}
              />
            ))}
          </Components.CodeInputContainer>

          {verificationError && <Components.ErrorMessage>{verificationError}</Components.ErrorMessage>}

          {verificationSuccess && <Components.SuccessMessage>{verificationSuccess}</Components.SuccessMessage>}

          <Components.ResendContainer>
            <Components.Paragraph>
              Didn't receive a code?
              {canResend ? (
                <Components.ResendButton onClick={handleResendCode} disabled={isVerifying}>
                  Resend code
                </Components.ResendButton>
              ) : (
                <span> Resend in {resendTimer}s</span>
              )}
            </Components.Paragraph>
          </Components.ResendContainer>

          <Components.Button onClick={verifyCode} disabled={verificationCode.includes("") || isVerifying}>
            {isVerifying ? "Verifying..." : "Verify"}
          </Components.Button>
        </Components.VerificationContainer>
      </ModalContainer>
    </ModalOverlay>
  )
}

const AuthenticationComponent = () => {
  const navigate = useNavigate()
  const [signIn, toggle] = useState(true)
  const [formData, setFormData] = useState(initialState)
  const [signInData, setSignInData] = useState({ email: "", password: "" })
  const [errors, setErrors] = useState({})
  const [countries, setCountries] = useState([])

  const [isAwaitingCode, setIsAwaitingCode] = useState(false)
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""])
  const [pendingUserId, setPendingUserId] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationError, setVerificationError] = useState("")
  const [verificationSuccess, setVerificationSuccess] = useState("")
  const [resendTimer, setResendTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef([])
  const hasAutoResent = useRef(false)

  // Estado para controlar la visibilidad del popup de verificación
  const [showVerificationPopup, setShowVerificationPopup] = useState(false)


  const timerRef = useRef(60)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifySource = params.get("verify");
    const token = params.get("token");
    const userId = params.get("userId");
  
    if (verifySource === "google") {
      Swal.fire({
        icon: "info",
        title: "Email Verification Required",
        text: "Please check your email and verify your account before signing in.",
        confirmButtonColor: "#ff4b2b"
      }).then(() => {
        toggle(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      });
      return;
    }
  
    // ✅ FLUJO Google Login + código SMS
    if (token && userId) {
      console.log("✅ Capturado desde URL:", { token, userId });
      setPendingUserId(userId);               // <-- Este es CLAVE para verificar luego
      setIsAwaitingCode(true);
      setShowVerificationPopup(true);
      setResendTimer(60);
      setCanResend(false);
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }
  
    // ✅ Solo token (sin userId) → Login directo
    if (token) {
      Swal.fire({
        icon: "success",
        title: "Login successful!",
        text: "Welcome back!",
        confirmButtonColor: "#ff4b2b"
      }).then(() => {
        localStorage.setItem("token", token);
        navigate("/profile-selector");
      });
    }
  }, []);
  

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await client.request(GET_COUNTRIES_QUERY)
        setCountries(data.getCountries)
      } catch (error) {
        console.error("Error fetching countries:", error)
      }
    }

    fetchCountries()
  }, [])

  useEffect(() => {
    if (!isAwaitingCode || timerRef.current <= 0) return

    const timerId = setInterval(() => {
      timerRef.current -= 1
      setResendTimer(timerRef.current)
    }, 1000)

    return () => clearInterval(timerId)
  }, [isAwaitingCode])


  useEffect(() => {
    if (timerRef.current === 0 && isAwaitingCode && !canResend && !hasAutoResent.current) {
      hasAutoResent.current = true
      setCanResend(true)
      resendCodeAutomatically()
    }
  }, [resendTimer, isAwaitingCode, canResend])

  // Enfocar el primer input solo al mostrar el popup, no con el timer
  useEffect(() => {
    if (showVerificationPopup && inputRefs.current[0]) {
      const timeout = setTimeout(() => {
        inputRefs.current[0].focus()
      }, 300)
      return () => clearTimeout(timeout)
    }
  }, [showVerificationPopup])

  const resendCodeAutomatically = async () => {
    try {
      const response = await fetch(`${API_URL}resend-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: pendingUserId }),
      })
      const data = await response.json()
      if (response.ok) {
        setVerificationSuccess("A new code has been sent to your phone")
        setCanResend(false)
        setTimeout(() => setVerificationSuccess(""), 3000)
      } else {
        setVerificationError(data.message || "Failed to resend code")
      }
    } catch (error) {
      setVerificationError("An error occurred. Please try again.")
    }
  }

  const handleChange = (e, isSignIn = false) => {
    const { name, value } = e.target
    if (isSignIn) {
      setSignInData((prev) => ({ ...prev, [name]: value }))
    } else {
      if (name === "country") {
        setFormData((prev) => {
          const selectedCountry = countries.find((c) => c.name === value)
          const code = selectedCountry ? selectedCountry.phone_code : ""
          return {
            ...prev,
            country: value,
            phoneCode: code,
            phoneNumber: "",
            phone: code,
          }
        })
      } else if (name === "phoneNumber") {
        setFormData((prev) => {
          const combinedPhone = `${prev.phoneCode} ${value}`.trim()
          return {
            ...prev,
            phoneNumber: value,
            phone: combinedPhone,
          }
        })
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }))
      }
    }
  }

  const resetForm = () => {
    setFormData(initialState)
  }

  const validateForm = () => {
    const errors = []
    if (!formData.email.includes("@")) errors.push("Invalid email format.")
    if (!formData.email || !formData.password) errors.push("Email and password are required.")
    if (!signIn && formData.password !== formData.confirmPassword) errors.push("Passwords do not match.")
    if (!signIn && !formData.name) errors.push("Name is required.")
    if (!signIn && !formData.phone) errors.push("Phone number is required.")

    if (errors.length > 0) {
      Swal.fire({ icon: "error", title: "Oops...", html: errors.join("<br/>") })
      return false
    }
    return true
  }

  const handleSignup = async () => {
    if (!validateForm()) return
    try {
      const response = await fetch(`${API_URL}signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.requiresVerification) {
          // Si se requiere verificación, mostrar el popup
          setPendingUserId(data.userId)
          setIsAwaitingCode(true)
          setResendTimer(60)
          setCanResend(false)
          setShowVerificationPopup(true) // Mostrar el popup
        } else {
          Swal.fire("Success!", data.message || "Please check your email to verify your account.", "success")
          resetForm()
          toggle(true) // Change to login screen
        }
      } else {
        throw new Error(data.message || "Failed to register")
      }
    } catch (error) {
      Swal.fire("Error!", error.message, "error")
    }
  }

  const handleLogin = async () => {
    if (!signInData.email || !signInData.password) {
      Swal.fire("Error!", "Please provide both email and password.", "error")
      return
    }

    try {
      const response = await fetch(`${API_URL}login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signInData),
      })

      const data = await response.json()

      // Si el backend indica que se requiere verificación
      if (data.requiresVerification) {
        setPendingUserId(data.userId)
        setIsAwaitingCode(true)
        setResendTimer(60)
        setCanResend(false)
        setShowVerificationPopup(true) // Mostrar el popup
        return
      }

      // Si el login fue exitoso y se recibió un token
      if (response.ok && data.token) {
        Swal.fire("Success!", "You have successfully logged in.", "success")
        localStorage.setItem("token", data.token)
        navigate("/profile-selector")
      } else {
        throw new Error(data.message || "Failed to log in")
      }
    } catch (error) {
      Swal.fire("Error!", error.message, "error")
    }
  }

  const handleSubmit = (event, isSignIn = false) => {
    event.preventDefault()
    isSignIn ? handleLogin() : handleSignup()
  }

  // Google Sign-In handler
  const handleGoogleSignIn = () => {
    window.location.href = "http://localhost:5000/api/users/google"
  }

  // Verification code handlers
  const handleCodeChange = (e, index) => {
    const value = e.target.value

    // Only allow numbers
    if (!/^\d*$/.test(value)) return

    // Update the verification code array
    const newCode = [...verificationCode]
    newCode[index] = value.slice(-1) // Only take the last character
    setVerificationCode(newCode)

    // Auto-focus next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleCodeKeyDown = (e, index) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1].focus()
    }

    // Handle arrow keys
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1].focus()
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleCodePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").trim()

    // Check if pasted content is all digits
    if (!/^\d+$/.test(pastedData)) return

    const digits = pastedData.slice(0, 6).split("")
    const newCode = [...verificationCode]

    digits.forEach((digit, index) => {
      if (index < 6) newCode[index] = digit
    })

    setVerificationCode(newCode)

    // Focus the next empty input or the last one
    const nextEmptyIndex = newCode.findIndex((digit) => digit === "")
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex].focus()
    } else {
      inputRefs.current[5].focus()
    }
  }

  const verifyCode = async () => {
    const code = verificationCode.join("");
  
    if (code.length !== 6) {
      setVerificationError("Please enter all 6 digits");
      return;
    }
  
    setIsVerifying(true);
    setVerificationError("");
    setVerificationSuccess("");
  
    try {
      console.log("📤 Enviando verificación con:", { userId: pendingUserId, code });
  
      const response = await fetch("http://localhost:5000/api/users/verify-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: pendingUserId, code }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setVerificationSuccess("Verification successful!");
        setTimeout(() => {
          setIsAwaitingCode(false);
          setShowVerificationPopup(false);
          localStorage.setItem("token", data.token);
          navigate("/profile-selector");
        }, 1500);
      } else {
        console.warn("❌ Código incorrecto:", data.message);
        setVerificationError(data.message || "Invalid verification code");
      }
    } catch (error) {
      setVerificationError("An error occurred. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };
  

  const handleResendCode = async () => {
    if (!canResend) return

    try {
      const response = await fetch(`${API_URL}resend-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: pendingUserId }),
      })

      const data = await response.json()

      if (response.ok) {
        setVerificationSuccess("A new code has been sent to your phone")
        timerRef.current = 60 // Update the ref
        setResendTimer(60) // Update the display
        setCanResend(false)
        setTimeout(() => setVerificationSuccess(""), 3000)
      } else {
        setVerificationError(data.message || "Failed to resend code")
      }
    } catch (error) {
      setVerificationError("An error occurred. Please try again.")
    }
  }

  const goBackFromVerification = () => {
    setIsAwaitingCode(false)
    setVerificationCode(["", "", "", "", "", ""])
    setVerificationError("")
    setVerificationSuccess("")
    setShowVerificationPopup(false) // Cerrar el popup
  }

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6)
  }, [])

  // Efecto para enfocar el primer input cuando se muestra el popup
  useEffect(() => {
    if (showVerificationPopup && inputRefs.current[0]) {
      setTimeout(() => {
        inputRefs.current[0].focus()
      }, 300) // Pequeño retraso para asegurar que el DOM esté listo
    }
  }, [showVerificationPopup])

  return (
    <div className="auth-page">
      <Components.Container>
        <Components.SignUpContainer signinIn={signIn}>
          <Components.SignUpForm onSubmit={(e) => handleSubmit(e, false)}>
            <Components.Title>Create Account</Components.Title>

            {/* Google Sign-Up Button */}
            <GoogleButton type="button" onClick={handleGoogleSignIn}>
              <FaGoogle />
              Sign up with Google
            </GoogleButton>

            <OrDivider>or</OrDivider>

            <Components.InputContainer>
              <Components.Icon>
                <FaUser />
              </Components.Icon>
              <Components.Input
                type="text"
                placeholder="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Components.InputContainer>
            <Components.InputContainer>
              <Components.Icon>
                <FaUser />
              </Components.Icon>
              <Components.Input
                type="text"
                placeholder="Surname"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
              />
            </Components.InputContainer>
            <Components.InputContainer>
              <Components.Icon>
                <FaEnvelope />
              </Components.Icon>
              <Components.Input
                type="email"
                placeholder="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Components.InputContainer>
            <Components.InputContainer>
              <Components.Icon>
                <FaLock />
              </Components.Icon>
              <Components.Input
                type="password"
                placeholder="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
            </Components.InputContainer>
            <Components.InputContainer>
              <Components.Icon>
                <FaLock />
              </Components.Icon>
              <Components.Input
                type="password"
                placeholder="Repeat Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </Components.InputContainer>
            <Components.InputContainer>
              <Components.Icon>
                <FaGlobe />
              </Components.Icon>
              <Components.Input as="select" name="country" value={formData.country} onChange={handleChange}>
                <option value="">Select your country</option>
                {countries.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </Components.Input>
            </Components.InputContainer>

            <PhoneInputWrapper>
              <PhoneCodeField>{formData.phoneCode || "+61"}</PhoneCodeField>
              <PhoneNumberField
                type="text"
                placeholder="Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </PhoneInputWrapper>

            <Components.InputContainer>
              <Components.Icon>
                <FaIdBadge />
              </Components.Icon>
              <Components.Input
                type="text"
                placeholder="Pin (6 digits)"
                name="pin"
                value={formData.pin}
                onChange={handleChange}
              />
            </Components.InputContainer>
            <Components.InputContainer>
              <Components.Icon>
                <FaCalendarAlt />
              </Components.Icon>
              <Components.Input
                type="date"
                placeholder="Date of Birth"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
              />
            </Components.InputContainer>
            {Object.values(errors).map((error) => (
              <Components.Paragraph key={error} style={{ color: "red" }}>
                {error}
              </Components.Paragraph>
            ))}
            <Components.Button type="submit">Sign Up</Components.Button>
          </Components.SignUpForm>
        </Components.SignUpContainer>

        <Components.SignInContainer signinIn={signIn}>
          <Components.SignInForm onSubmit={(e) => handleSubmit(e, true)}>
            <Components.Title>Sign In</Components.Title>

            {/* Google Sign-In Button */}
            <GoogleButton type="button" onClick={handleGoogleSignIn}>
              <FaGoogle />
              Sign in with Google
            </GoogleButton>

            <OrDivider>or</OrDivider>

            <Components.InputContainer>
              <Components.Icon>
                <FaEnvelope />
              </Components.Icon>
              <Components.Input
                type="email"
                placeholder="Email"
                name="email"
                value={signInData.email}
                onChange={(e) => handleChange(e, true)}
              />
            </Components.InputContainer>
            <Components.InputContainer>
              <Components.Icon>
                <FaLock />
              </Components.Icon>
              <Components.Input
                type="password"
                placeholder="Password"
                name="password"
                value={signInData.password}
                onChange={(e) => handleChange(e, true)}
              />
            </Components.InputContainer>
            <Components.Anchor href="#">Forgot your password?</Components.Anchor>
            <Components.Button>Sign In</Components.Button>
          </Components.SignInForm>
        </Components.SignInContainer>

        <Components.OverlayContainer signinIn={signIn}>
          <Components.Overlay signinIn={signIn}>
            <Components.LeftOverlayPanel signinIn={signIn}>
              <Components.Title>Welcome Back!</Components.Title>
              <Components.Paragraph>Ready for more adventures? Log in with your info!</Components.Paragraph>
              <Components.GhostButton onClick={() => toggle(true)}>Sign In</Components.GhostButton>
            </Components.LeftOverlayPanel>
            <Components.RightOverlayPanel signinIn={signIn}>
              <Components.Title>Hello, New Explorer!</Components.Title>
              <Components.Paragraph>Join us and discover a world of fun and learning!</Components.Paragraph>
              <Components.GhostButton onClick={() => toggle(false)}>Sign Up</Components.GhostButton>
            </Components.RightOverlayPanel>
          </Components.Overlay>
        </Components.OverlayContainer>
      </Components.Container>

      {/* Renderizar el popup de verificación */}
      <VerificationPopup
        showVerificationPopup={showVerificationPopup}
        goBackFromVerification={goBackFromVerification}
        verificationCode={verificationCode}
        handleCodeChange={handleCodeChange}
        handleCodeKeyDown={handleCodeKeyDown}
        handleCodePaste={handleCodePaste}
        isVerifying={isVerifying}
        inputRefs={inputRefs}
        verificationError={verificationError}
        verificationSuccess={verificationSuccess}
        canResend={canResend}
        handleResendCode={handleResendCode}
        resendTimer={resendTimer}
        verifyCode={verifyCode}
      />
    </div>
  )
}

export default AuthenticationComponent
