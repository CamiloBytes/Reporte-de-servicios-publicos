const data = {
    get: async (url) =>{
        const response = await fetch(enpoindt)
        if (!response.ok){
            throw new Error("Error en la petición GET");
            data = response.json()
        }
    },
    post: async (url, data) =>{
        const response = await fetch(enpoindt, {
            method: POST,
            headers:{"Content-Type": "application/json"},
            body:JSON.stringify(data)
        })
        if(!response.ok){
            throw new Error("Error en la peticion POST");
            
        }
    } 
}