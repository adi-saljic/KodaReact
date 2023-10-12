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


router.get('/',query.prikaziSort, query.prikazPasa, function(req,res,next){
    res.json({message: req.raseSort, psi : req.psi})
})

//NEKADA PROVJERITI DA LI JE DOBRA PRAKSA OVO SA TOKENOM I KAKO BI SE TO MOGLO BOLJE

router.post('/odabran',function (req,res){
    console.log(makingQuery(req.body))
    pool.query(makingQuery(req.body), (err, result) => {
        if(err){
            console.log(err);
        }else{
            const raseRecommended = result.rows;
            const uniqueToken = Date.now().toString();
            dataStore[uniqueToken] = raseRecommended;
            res.redirect(`/rase/recommended?token=${uniqueToken}`);
        }
       
    });


});

router.get('/recommended', function(req,res,next){
    const token = req.query.token;
    const raseRecommended = dataStore[token];

    if (raseRecommended) {
        // Use the data
        console.log("Tuu ", raseRecommended);

        // Delete the data after it has been used (for security and memory management)
        delete dataStore[token];

        // You can send the raseRecommended data to the client or perform other actions
        res.send(raseRecommended);
    } else {
        // Handle cases where the token is invalid or expired
        res.status(404).send("Data not found or token expired");
    }
})


module.exports = router;