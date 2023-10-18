var express = require('express');
var router = express.Router();
const pool = require('../db/Pool')
const url = require('url');
const dataStore = {};
let query = {
    prikaziSort :function (req,res,next){
            pool.query(`select * from rasa order by ime`, (err, result) => {
                if(err){
                    console.log(err);
                }else{
                    req.raseSort = result.rows;
                    next();
                }
            });
    },
    prikazPasa: function (req,res,next){
        pool.query(`select pas.* , u.ime_uzgajivacnice, u.grad as grad,u.drzava as drzava, r.ime as rasa from pas inner join uzgajivac u on u.id = pas.id_uzgajivaca inner join rasa r on r.id_rase = pas.id_rase ;`,
            (err,result) => {
                req.psi = result.rows;
                next();
            })
      },
      prikazRase: function (req,res,next){
        pool.query(`select * from rasa where id_rase = $1 ;`,[req.params.id],
            (err,result) => {
                console.log("Inside query " ,result.rows)
                req.breedDetails = result.rows;
                next();
            })
      },
}

// KATEGORIJA  SU POZITIVNE KARAKTERISTIKE (KARAKTERISTIKE U KOJIM SE GLEDA DA LI JE OCENA > 2)
// KATEGORIJA 2 SU NEGATIVNE KARAKTERISTIKE (KARAKTERISTIKE U KOJIM SE GLEDA DA LI JE OCJENA < 3)
// KATEGORIJA 3 SU VELICINE
function makingQuery(body){
    let queryString = "SELECT * FROM rasa where ";
    if(!body.kategorija3){                                                      // KATEGORIJA 3 = 0
        if(!body.kategorija2){                                                  // KATEGORIJA 3 = 0 AND KATEGORIJA 2 = 0
            if(typeof body.kategorija === 'string'){                            // KATEGORIJA 3 = 0 AND KATEGORIJA 2 = 0 AND KATEGORIJA = 1
                queryString+= " CAST( "+ body.kategorija + " AS integer) > 2";
            }
            else{                                                               // KATEGORIJA 3 = 0 AND KATEGORIJA 2 = 0 AND KATEGORIJA >= 2
                for(let i = 0; i < body.kategorija.length - 1; i++){
                    queryString+= " CAST( "+ body.kategorija[i] + " AS integer) > 2 AND ";
                }
                queryString+= " CAST( "+ body.kategorija[body.kategorija.length - 1] + " AS integer) > 2 ";
            }
        }
        else{
            if(typeof body.kategorija2 === 'string'){                               // KATEGORIJA 3 = 0 AND KATEGORIJA 2 = 1

                queryString+= " CAST( "+ body.kategorija2 + " AS integer) < 3 ";

                if(body.kategorija){

                    if(typeof body.kategorija === 'string'){                        // KATEGORIJA 3 = 0 AND KATEGORIJA 2 = 1 AND KATEGORIJA = 1
                        queryString+= "AND CAST( "+ body.kategorija + " AS integer) > 2";
                    }
                    else{
                        queryString+= "AND CAST( "+ body.kategorija[0] + " AS integer) > 2 AND ";                                                           // KATEGORIJA 3 = 0 AND KATEGORIJA 2 = 1 AND KATEGORIJA >= 2
                        for(let i = 1; i < body.kategorija.length - 1; i++){
                            queryString+= " CAST( "+ body.kategorija[i] + " AS integer) > 2 AND ";
                        }
                        queryString+= " CAST( "+ body.kategorija[body.kategorija.length - 1] + " AS integer) > 2 ";
                    }
                }
                
            }
            else{                                                                   // KATEGORIJA 3 = 0 AND KATEGORIJA 2 >= 2
                
                for(let i = 0; i < body.kategorija2.length - 1; i++){
                    queryString+= " CAST( "+ body.kategorija2[i] + " AS integer) < 3 AND ";
                }
                queryString+= " CAST( "+ body.kategorija2[body.kategorija2.length - 1] + " AS integer) < 3 ";

                if(body.kategorija){                                                
                
                    if(typeof body.kategorija === 'string'){                        // KATEGORIJA 3 = 0 AND KATEGORIJA 2 >= 2 AND KATEGORIJA = 1
                        queryString+= "AND CAST( "+ body.kategorija + " AS integer) > 2";
                    }
                    else{
                        queryString+= "AND CAST( "+ body.kategorija[0] + " AS integer) > 2 AND ";                                                           // KATEGORIJA 3 = 0 AND KATEGORIJA 2 >= 2 AND KATEGORIJA >= 2
                        for(let i = 1; i < body.kategorija.length - 1; i++){
                            queryString+= " CAST( "+ body.kategorija[i] + " AS integer) > 2 AND ";
                        }
                        queryString+= " CAST( "+ body.kategorija[body.kategorija.length - 1] + " AS integer) > 2 ";
                    }
                }
            }

        }
 
    }
    else{
        if(typeof body.kategorija3 === 'string'){ // IZABRANA JE SAMO JEDNA VELICINA
            queryString+= "CAST(velicina AS integer) = " + body.kategorija3;
            if(!body.kategorija2){  
                if(body.kategorija){                                                   // KATEGORIJA 3 = 1 AND KATEGORIJA 2 = 0
                    if(typeof body.kategorija === 'string'){                            // KATEGORIJA 3 = 1 AND KATEGORIJA 2 = 0 AND KATEGORIJA = 1
                        queryString+= " AND CAST( "+ body.kategorija + " AS integer) > 2";
                    }
                    else{
                        queryString+= " AND CAST( "+ body.kategorija[0] + " AS integer) > 2 AND ";      // KATEGORIJA 3 = 1 AND KATEGORIJA 2 = 0 AND KATEGORIJA >= 2
                        for(let i = 1; i < body.kategorija.length - 1; i++){
                            queryString+= " CAST( "+ body.kategorija[i] + " AS integer) > 2 AND ";
                        }
                        queryString+= " CAST( "+ body.kategorija[body.kategorija.length - 1] + " AS integer) > 2 ";
                    }

                }                                                
                
            }
            else{
                if(typeof body.kategorija2 === 'string'){                               // KATEGORIJA 3 = 1 AND KATEGORIJA 2 = 1
    
                    queryString+= " AND CAST( "+ body.kategorija2 + " AS integer) < 3 ";
    
                    if(body.kategorija){
    
                        if(typeof body.kategorija === 'string'){                        // KATEGORIJA 3 = 1 AND KATEGORIJA 2 = 1 AND KATEGORIJA = 1
                            queryString+= " AND CAST( "+ body.kategorija + " AS integer) > 2";
                        }
                        else{                                                           // KATEGORIJA 3 = 1 AND KATEGORIJA 2 = 1 AND KATEGORIJA >= 2
                            queryString+= " AND CAST( "+ body.kategorija[0] + " AS integer) > 2 AND ";
                            for(let i = 1; i < body.kategorija.length - 1; i++){
                                queryString+= " CAST( "+ body.kategorija[i] + " AS integer) > 2 AND ";
                            }
                            queryString+= " CAST( "+ body.kategorija[body.kategorija.length - 1] + " AS integer) > 2 ";
                        }
                    }
                    
                }
                else{                                                                   // KATEGORIJA 3 = 1 AND KATEGORIJA 2 >= 2
                    queryString+= " AND CAST( "+ body.kategorija2[0] + " AS integer) < 3 AND ";
                    for(let i = 1; i < body.kategorija2.length - 1; i++){
                        queryString+= "  CAST( "+ body.kategorija2[i] + " AS integer) < 3 AND ";
                    }
                    queryString+= " CAST( "+ body.kategorija2[body.kategorija2.length - 1] + " AS integer) < 3 ";
    
                    if(body.kategorija){                                                
                    
                        if(typeof body.kategorija === 'string'){                        // KATEGORIJA 3 = 1 AND KATEGORIJA 2 >= 2 AND KATEGORIJA = 1
                            queryString+= " AND CAST( "+ body.kategorija + " AS integer) > 2";
                        }
                        else{
                            queryString+= "AND CAST( "+ body.kategorija[0] + " AS integer) > 2 AND "                                                           // KATEGORIJA 3 = 1 AND KATEGORIJA 2 >= 2 AND KATEGORIJA >= 2
                            for(let i = 1; i < body.kategorija.length - 1; i++){
                                queryString+= " CAST( "+ body.kategorija[i] + " AS integer) > 2 AND ";
                            }
                            queryString+= " CAST( "+ body.kategorija[body.kategorija.length - 1] + " AS integer) > 2 ";
                        }
                    }
                }
    
            }
        }
        else{ // IZABRANE SU SAMO DVIJE VELICINE
            queryString+= "(CAST(velicina AS integer) = "+ body.kategorija3[0] + " OR CAST(velicina AS integer) = " + body.kategorija3[1] + ")";

            if(!body.kategorija2){  
                if(body.kategorija){                                                   // KATEGORIJA 3 = 2 AND KATEGORIJA 2 = 0
                    if(typeof body.kategorija === 'string'){                            // KATEGORIJA 3 = 2 AND KATEGORIJA 2 = 0 AND KATEGORIJA = 1
                        queryString+= " AND CAST( "+ body.kategorija + " AS integer) > 2";
                    }
                    else{  
                        queryString+= " AND CAST( "+ body.kategorija[0] + " AS integer) > 2 AND ";                                                             // KATEGORIJA 3 = 2 AND KATEGORIJA 2 = 0 AND KATEGORIJA >= 2
                        for(let i = 1; i < body.kategorija.length - 1; i++){
                            queryString+= " CAST( "+ body.kategorija[i] + " AS integer) > 2 AND ";
                        }
                        queryString+= " CAST( "+ body.kategorija[body.kategorija.length - 1] + " AS integer) > 2 ";
                    }

                }                                                
                
            }
            else{
                if(typeof body.kategorija2 === 'string'){                               // KATEGORIJA 3 = 2 AND KATEGORIJA 2 = 1
    
                    queryString+= " AND CAST( "+ body.kategorija2 + " AS integer) < 3 ";
    
                    if(body.kategorija){
    
                        if(typeof body.kategorija === 'string'){                        // KATEGORIJA 3 = 2 AND KATEGORIJA 2 = 1 AND KATEGORIJA = 1
                            queryString+= " AND CAST( "+ body.kategorija + " AS integer) > 2";
                        }
                        else{    
                            queryString+= " AND CAST( "+ body.kategorija[0] + " AS integer) > 2 AND ";                                                       // KATEGORIJA 3 = 2 AND KATEGORIJA 2 = 1 AND KATEGORIJA >= 2
                            for(let i = 1; i < body.kategorija.length - 1; i++){
                                queryString+= " CAST( "+ body.kategorija[i] + " AS integer) > 2 AND ";
                            }
                            queryString+= " CAST( "+ body.kategorija[body.kategorija.length - 1] + " AS integer) > 2 ";
                        }
                    }
                    
                }
                else{                                                                   // KATEGORIJA 3 = 2 AND KATEGORIJA 2 >= 2
                    queryString+= " AND CAST( "+ body.kategorija2[0] + " AS integer) < 3 AND ";
                    for(let i = 1; i < body.kategorija2.length - 1; i++){
                        queryString+= " CAST( "+ body.kategorija2[i] + " AS integer) < 3 AND ";
                    }
                    queryString+= " CAST( "+ body.kategorija2[body.kategorija2.length - 1] + " AS integer) < 3 ";
    
                    if(body.kategorija){                                                
                    
                        if(typeof body.kategorija === 'string'){                        // KATEGORIJA 3 = 2 AND KATEGORIJA 2 >= 2 AND KATEGORIJA = 1
                            queryString+= " AND CAST( "+ body.kategorija + " AS integer) > 2";
                        }
                        else{     
                            queryString+= " AND CAST( "+ body.kategorija[0] + " AS integer) > 2 AND ";                                                      // KATEGORIJA 3 = 2 AND KATEGORIJA 2 >= 2 AND KATEGORIJA >= 2
                            for(let i = 1; i < body.kategorija.length - 1; i++){
                                queryString+= " CAST( "+ body.kategorija[i] + " AS integer) > 2 AND ";
                            }
                            queryString+= " CAST( "+ body.kategorija[body.kategorija.length - 1] + " AS integer) > 2 ";
                        }
                    }
                }
    
            }
        }
    }

    return queryString;
}

function razdvojiRasePoKategorijama(rase){
    
    let kat1 = [];
    let kat2 = [];
    let kat3 = [];
    const kategorija = ["zivot_u_stanu",
                        'pogodan_za_nove_vlasnike',
                        'otpornost_na_hladnocu',
                        'tolerise_usamljenost',
                        'otpornost_na_toplotu',
                        'vjeran_obitelji',
                        'prijateljstvo_sa_psima',
                        'pogodan_za_djecu',
                        'prijateljstvo_sa_strancima',
                        'koliko_slini',
                        'pogodan_za_treniranje',
                        'sposobnost_lova',
                        'potreba_za_kretanjem',
                        'nivo_energije',
                        'volja_za_igrom'
                        ];
   const kategorija2 = ['linjanje',
                        'potencijal_debljanja',
                        'koliko_slini',
                        'mogucnost_lutanja',
                        'glasnost',
                        'mala_potreba_za_kretanjem'
                        ];

    for (let i =0; i<rase.length; i++){
        if(kategorija.includes(rase[i])){
            kat1.push(rase[i]);
        }
        else if(kategorija2.includes(rase[i])){
            rase[i] === 'mala_potreba_za_kretanjem' ? kat2.push('potreba_za_kretanjem') : kat2.push(rase[i]);
        }
        else{
            switch(rase[i]){
                case 'jako_mali' : kat3.push('1') ; break;
                case 'mali' : kat3.push('2') ; break;
                case 'srednji' : kat3.push('3') ; break;
                case 'veliki' : kat3.push('4') ; break;
                case 'jako_veliki' : kat3.push('5') ; break;
            }
            
        }
    }
    return {
        kategorija : kat1,
        kategorija2 : kat2,
        kategorija3 : kat3.length === 1 ? kat3[0] : kat3
    }
}


router.get('/',query.prikaziSort, query.prikazPasa, function(req,res,next){
    res.json({message: req.raseSort, psi : req.psi})
})

//NEKADA PROVJERITI DA LI JE DOBRA PRAKSA OVO SA TOKENOM I KAKO BI SE TO MOGLO BOLJE

router.post('/odabran',function (req,res){
    let values = req.body.checkedValues
    pool.query(makingQuery(razdvojiRasePoKategorijama(values)), (err, result) => {
        if(err){
            console.log(err);
        }else{
            const raseRecommended = result.rows;
            res.status(200).json({ raseRecommended });
            
        }
       
    });


});

router.get('/recommended', function(req,res,next){
    const token = req.query.token;
    const raseRecommended = dataStore[token];
    setTimeout(() => {
        console.log("desi se 2")
        if (raseRecommended) {
            // Use the data
            console.log("Tuu ", raseRecommended);
            res.json({raseRecommended : {}});
    
            // Delete the data after it has been used (for security and memory management)
            delete dataStore[token];
    
            // You can send the raseRecommended data to the client or perform other actions
            
        } else {
            // Handle cases where the token is invalid or expired
            res.status(404).send("Data not found or token expired");
        }
    },5000)
})

router.get('/breed/:id',query.prikazRase, function(req,res,next){
    console.log(req.breedDetails)
    res.json({breedDetails: req.breedDetails})
})


module.exports = router;