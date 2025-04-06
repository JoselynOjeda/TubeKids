import axios from "axios";

const API_URL = "http://localhost:5000/api/videos";  // URL de tu backend

export const obtenerVideos = async () => {
  return await axios.get(API_URL);
};

export const agregarVideo = async (video) => {
  return await axios.post(API_URL, video);
};

export const actualizarVideo = async (id, video) => {
  return await axios.put(`${API_URL}/${id}`, video);
};

export const eliminarVideo = async (id) => {
  return await axios.delete(`${API_URL}/${id}`);
};
