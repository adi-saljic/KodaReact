var express = require('express');
var router = express.Router();
const pool = require('../db/Pool')

function getSimilar(dog){
   
}

let query = {
    showDogDetailsById : function (req,res,next){
            pool.query(`select  pas.*,
                        r.id_rase as idRase, r.ime as imeRase, r.slika as slikaRase,
                        u.id as idProd, u.ime as imeProd, u.prezime as prezime, u.grad as grad,
                        u.drzava as drzava, u.broj_telefona as brojTelefona
                        from pas
                        inner join rasa r on r.id_rase = pas.id_rase
                        inner join uzgajivac u on u.id = pas.id_uzgajivaca
                        where id_psa =  $1 `,[req.params.id], (err, result) => {
                if(err){
                    console.log(err);
                }else{
                    req.dogDetails = result.rows;
                    pool.query(`select  pas.*,
                    r.id_rase as idRase, r.ime as imeRase, r.slika as slikaRase,
                    u.id as idProd, u.ime as imeProd, u.prezime as prezime, u.grad as grad,
                    u.drzava as drzava, u.broj_telefona as brojTelefona
                    from pas
                    inner join rasa r on r.id_rase = pas.id_rase
                    inner join uzgajivac u on u.id = pas.id_uzgajivaca
                    WHERE r.id_rase = $1
                    OR u.id = $2; `,[req.dogDetails[0].idrase, req.dogDetails[0].idprod], (err, result) => {
                    if(err){
                        console.log(err);
                    }else{
                        req.similar = result.rows;
                        next();
                    }
                });
                    
                }
            });
    },
}


router.get('/:id',query.showDogDetailsById, function(req,res,next){
    console.log(req.similar)
    res.json({dogDetails: req.dogDetails, similarDogs: req.similar})
})


module.exports = router;