import React, { useState } from "react";
import axios from "axios";
import "./form.css"; // Importando o arquivo CSS

function Form() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post("http://localhost:3000/subscribe", { email });
            alert("Inscrito com sucesso!");
            setEmail("");
        } catch (error) {
            alert("Erro ao se inscrever.");
        }
        setLoading(false);
    };

    return (
        <div className="form-container">
            <form onSubmit={handleSubmit} className="form-box">
                <h2>Inscreva seu Email para receber a cotação diária do Euro</h2>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Digite seu e-mail"
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Enviando..." : "Inscrever-se"}
                </button>
            </form>
        </div>
    );
}

export default Form;
