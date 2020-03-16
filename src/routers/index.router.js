const express = require('express');

const router = express.Router(); //função que cria um novo servidor

//Dentro da função server podemos acessar as req http get, post, put, delete
// Primeiro parametro é a rota
// Segundo é uma função que recebe uma requisição (tudo o que o usuário requere ao servidor) e uma resposta
// Por default o browser só envia método GET

router.get('/', (req, res) => {
	res.status(200).send({
		title: 'API - Campanha do Murilo',
		status: 'Funcionando'
	});
});

module.exports = router;


