const { io } = require('../server');
const { Usuarios } = require('../classes/usuarios');
const { crearMensaje } = require('../utilidades/utilidades');

const usuarios = new Usuarios();

io.on('connection', (client) => {

    client.on('entrarChat', (usuario, callback) => {

        if (!usuario.nombre || !usuario.sala){
            return callback({
                error: true,
                msj: 'El nombre y la sala son necesarios'
            })
        }

        client.join(usuario.sala);

        usuarios.agregarPersona( client.id, usuario.nombre, usuario.sala );

        //client.broadcast.to(usuario.sala).emit( 'listaPersona', usuarios.getPersonasPorSala(usuario.sala) )
        client.broadcast.to(usuario.sala).emit( 'personaConectada', usuarios.getPersonasPorSala(usuario.sala) )
        client.broadcast.to(usuario.sala).emit('crearMensaje', crearMensaje('Admin', `${usuario.nombre} ha ingresado a la sala de chat`) )

        callback(usuarios.getPersonasPorSala(usuario.sala));
    });


    client.on('crearMensaje', (data, callback) => {
        let persona = usuarios.getPersona(client.id)

        let mensaje = crearMensaje( persona.nombre, data.mensaje )
        client.broadcast.to(data.sala).emit('crearMensaje', mensaje )

        callback(mensaje)
    });


    client.on('disconnect', () => {
        
        let personaBorrada = usuarios.borrarPersona( client.id );
    
        client.broadcast.to(personaBorrada.sala).emit('crearMensaje', crearMensaje('Admin', `${personaBorrada.nombre} ha abandonado la sala de chat`) )
        client.broadcast.to(personaBorrada.sala).emit('personaConectada', usuarios.getPersonasPorSala(personaBorrada.sala) )

    
    });

    client.on('MP', data => {

        let persona = usuarios.getPersona(client.id);
        client.broadcast.to(data.para).emit('MP', crearMensaje(persona.nombre, data.mensaje));

    });

});