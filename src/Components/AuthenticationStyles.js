import styled, { keyframes } from "styled-components";

// Existing components from your file
export const Background = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/assets/fondo.png');
  background-size: cover;
  background-position: center;
  filter: blur(8px);
  z-index: -1;
`;

export const Container = styled.div`
  background-color: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
  position: relative;
  overflow: hidden;
  width: 1000px; // Increased width for more space
  max-width: 100%; // Ensures it does not exceed the width of the viewport
  min-height: 485px; // Increased height to accommodate larger form elements
  display: flex;
  justify-content: center;
  align-items: center; // Center items vertically and horizontally
  padding: 50px; // Increased padding for more internal space
`;

export const SignUpContainer = styled.div`
 position: absolute;
 top: 0;
 height: 100%;
 transition: all 0.6s ease-in-out;
 left: 0;
 width: 50%;
 opacity: 0;
 z-index: 1;
 ${(props) =>
   props.signinIn !== true
     ? `
   transform: translateX(100%);
   opacity: 1;
   z-index: 5;
 `
     : null}
`;

export const SignInContainer = styled.div`
  position: absolute;
  top: 0;
  height: 100%;
  transition: all 0.6s ease-in-out;
  left: 0;
  width: 50%;
  z-index: 2;
  ${(props) => (props.signinIn !== true ? `transform: translateX(100%);` : null)}
`;

export const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`;

export const Icon = styled.span`
  position: absolute;
  left: 10px;
  display: flex;
  align-items: center;
  color: #ccc;
`;

export const Input = styled.input`
  width: 100%;
  padding: 10px 10px 10px 30px; // Añadir padding izquierdo para el icono
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
`;

export const SignUpForm = styled.form`
  background-color: #ffffff;
  display: grid;
  grid-template-columns: 1fr 1fr;  // Dos columnas
  column-gap: 20px;  // Espacio entre columnas
  row-gap: 15px;  // Espacio entre filas
  padding: 40px;
  align-items: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  box-sizing: border-box;
  width: 100%;  // Full width of the container
  max-width: 800px;  // Maximum width of the form
  margin: auto;  // Center the form within the Container
`;

export const SignInForm = styled.form`
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  padding: 100px;
  align-items: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  box-sizing: border-box;
  width: 100%;
  max-width: 800px;
  margin: auto;

  ${InputContainer} {
    margin-bottom: 20px; // Añadir margen al fondo de cada Input
  }

  ${Input}:last-child {
    margin-bottom: 0; // Eliminar margen del último Input para evitar espaciado extra al final
  }
`;

export const Title = styled.h1`
  grid-column: 1 / -1;  // Span across all columns
  font-weight: bold;
  font-size: 24px;  // Adjust size as needed
  text-align: center;  // Center the title
  margin-bottom: 20px;  // Add some space below the title
`;

export const Label = styled.input`
  display: block;
  margin-bottom: 5px;  // Space between label and input
  color: #333;  // Dark grey color for text
  font-size: 14px;  // Font size for labels
`;

export const Button = styled.button`
  grid-column: 1 / -1;  // Span across all columns
  padding: 15px 0;
  background-color: #ff4b2b;
  color: white;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  width: 50%;  // Control width to not span full width
  justify-self: center;  // Center the button in the grid
  margin-top: 20px;  // Space above the button
  border: none;
  transition: transform 80ms ease-in;
  &:hover {
    background-color: #e04322;  // Slightly darker on hover for feedback
  }
  &:active {
    transform: scale(0.95);    // Slight press effect
  }
  &:focus {
    outline: none;             // Remove focus outline for aesthetics
  }
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

export const GhostButton = styled(Button)`
  background-color: transparent;
  border-color: #ffffff;
`;

export const Anchor = styled.a`
  color: #333;
  font-size: 14px;
  text-decoration: none;
  margin: 15px 0;
`;

export const OverlayContainer = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  width: 50%;
  height: 100%;
  overflow: hidden;
  transition: transform 0.6s ease-in-out;
  z-index: 100;
  ${(props) => (props.signinIn !== true ? `transform: translateX(-100%);` : null)}
`;

export const Overlay = styled.div`
  background: #ff416c;
  background: -webkit-linear-gradient(to right, #ff4b2b, #ff416c);
  background: linear-gradient(to right, #ff4b2b, #ff416c);
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 0 0;
  color: #ffffff;
  position: absolute;
  left: -100%;
  height: 100%;
  width: 200%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
  ${(props) => (props.signinIn !== true ? `transform: translateX(50%);` : null)}
`;

export const OverlayPanel = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 40px;
  text-align: center;
  top: 0;
  height: 100%;
  width: 50%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
`;

export const LeftOverlayPanel = styled(OverlayPanel)`
  transform: translateX(-20%);
  ${(props) => (props.signinIn !== true ? `transform: translateX(0);` : null)}
`;

export const RightOverlayPanel = styled(OverlayPanel)`
  right: 0;
  transform: translateX(0);
  ${(props) => (props.signinIn !== true ? `transform: translateX(20%);` : null)}
`;

export const Paragraph = styled.p`
  font-size: 14px;
  font-weight: 100;
  line-height: 20px;
  letter-spacing: 0.5px;
  margin: 20px 0 30px;
`;

// New styles for verification code component
export const VerificationContainer = styled.div`
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  box-sizing: border-box;
  width: 100%;
  max-width: 500px;
  margin: auto;
  position: relative;
`;

export const CodeInputContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 20px 0;
  width: 100%;
`;

export const CodeInput = styled.input`
  width: 50px;
  height: 60px;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  border: 2px solid #ccc;
  border-radius: 8px;
  margin: 0 5px;
  transition: border-color 0.3s;

  &:focus {
    border-color: #ff4b2b;
    outline: none;
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

export const ErrorMessage = styled.p`
  color: #e74c3c;
  font-size: 14px;
  margin: 10px 0;
  text-align: center;
`;

export const SuccessMessage = styled.p`
  color: #2ecc71;
  font-size: 14px;
  margin: 10px 0;
  text-align: center;
`;

export const ResendContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 10px 0;
`;

export const ResendButton = styled.button`
  background: none;
  border: none;
  color: #ff4b2b;
  font-size: 14px;
  cursor: pointer;
  margin-left: 5px;
  text-decoration: underline;

  &:disabled {
    color: #ccc;
    cursor: not-allowed;
    text-decoration: none;
  }
`;

export const BackButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 5px;
  color: #666;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    color: #ff4b2b;
  }
`;

// New components converted from CSS classes

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f9fafb;
  padding: 2rem;
`;

export const Header = styled.header`
  text-align: center;
  margin-bottom: 2rem;
`;

export const SubTitle = styled.p`
  color: #6b7280;
  font-size: 1rem;
`;

export const Card = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  margin: 0 auto;
`;

export const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const StyledLabel = styled.label`
  font-weight: 500;
  color: #374151;
`;

export const StyledInput = styled.input`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
`;

export const LoginButton = styled.button`
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 0.375rem;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #4338ca;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.5);
  }
`;

// Animation for fade in effect
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const VerificationSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  animation: ${fadeIn} 0.3s ease;
`;

export const VerificationMessage = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
`;

export const DigitInputContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
`;

export const DigitInput = styled.input`
  width: 3rem;
  height: 3rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  text-align: center;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.3);
  }
`;

export const VerifyButton = styled.button`
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 0.375rem;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #4338ca;
  }

  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
`;

export const ResendLink = styled.button`
  background: none;
  border: none;
  color: #4f46e5;
  font-size: 0.875rem;
  cursor: pointer;
  text-align: center;
  padding: 0;
  text-decoration: underline;

  &:hover {
    color: #4338ca;
  }
`;



const slideIn = keyframes`
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const ModalOverlay = styled.div`
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
`;

export const ModalContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
  animation: ${slideIn} 0.3s ease;
`;

export const CloseButton = styled.button`
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
`;