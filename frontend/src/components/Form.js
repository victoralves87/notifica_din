import React, { useState } from "react";
import axios from "axios";

function Form() {
    const [email, setEmail] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:3000/subscribe", { email });
            alert("Inscrito com sucesso!");
            setEmail("");
        } catch (error) {
            alert("Erro ao se inscrever.");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu e-mail"
                required
            />
            <button type="submit">Inscrever-se</button>
        </form>
    );
}

export default Form;
