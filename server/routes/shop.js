var express = require('express');
var router = express.Router();
const pool = require('../db/Pool')

let query = {
    prikazPasa: function (req,res,next){
        pool.query(`select pas.* , u.ime_uzgajivacnice, u.grad as grad,u.drzava as drzava, r.ime as rasa from pas inner join uzgajivac u on u.id = pas.id_uzgajivaca inner join rasa r on r.id_rase = pas.id_rase ;`,
            (err,result) => {
                req.psi = result.rows;
                next();
            })
      },
}


router.get('/', query.prikazPasa, function(req,res,next){
    res.json({message: req.raseSort, psi : req.psi})
})


module.exports = router;