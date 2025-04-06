import styled from 'styled-components';

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
 ${props => props.signinIn !== true ? `
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
${props => (props.signinIn !== true ? `transform: translateX(100%);` : null)}
`;

export const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`;

// Estilo para el icono
export const Icon = styled.span`
  position: absolute;
  left: 10px;
  display: flex;
  align-items: center;
  color: #ccc;
`;

// Ajustar Input para añadir padding y dejar espacio para el icono
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

// Estilos para el formulario de inicio de sesión manteniendo un diseño lineal
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
  border : none;
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
${props =>
    props.signinIn !== true ? `transform: translateX(-100%);` : null}
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
${props => (props.signinIn !== true ? `transform: translateX(50%);` : null)}
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
  ${props => props.signinIn !== true ? `transform: translateX(0);` : null}
`;

export const RightOverlayPanel = styled(OverlayPanel)`
    right: 0;
    transform: translateX(0);
    ${props => props.signinIn !== true ? `transform: translateX(20%);` : null}
`;

export const Paragraph = styled.p`
font-size: 14px;
  font-weight: 100;
  line-height: 20px;
  letter-spacing: 0.5px;
  margin: 20px 0 30px
`;