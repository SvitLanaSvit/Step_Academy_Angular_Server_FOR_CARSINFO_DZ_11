const express = require("express");
const app = express();
const port = 3000;
const jsonParser = express.json();

var pgp = require("pg-promise")(/*options*/);
var db = pgp("postgres://postgres:pass@localhost:5433/CarsInfo"); //pass need to write was is in Postgres in exit!!!

app.use((req, resp, next)=>{
    resp.setHeader("Access-Control-Allow-Origin", "*");
    resp.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    resp.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    next();
});
app.get('/car/:id', async (req, resp) =>{
    let id = req.params.id;
    console.log(`Car with id: ${id}`);
    let car = await db.one(`SELECT * FROM "Cars" WHERE id=${id}`);
    resp.json(car);
});
app.delete("/car/:id", async (req, resp) =>{
    let id = req.params.id;
    console.log(`Car with id: ${id}`);
    let result = await db.one(`DELETE FROM public."Cars" WHERE id=${id} returning id`);
    result.message = "success";
    console.log(result);
    resp.json(result);
});
app.put("/car/:id", jsonParser, async(req, resp)=>{
    let id = req.params.id;
    if(!id)
        resp.sendStatus(404);
    let car = await db.one(`SELECT * FROM public."Cars" WHERE id=${id}`);
    if(!car)
        resp.sendStatus(404);
    if(!req.body)
        resp.sendStatus(404);
    car.model = req.body.model;
    car.manufacturer = req.body.manufacturer;
    car.ps = req.body.ps;
    car.price = req.body.price;
    car.currency_code = req.body.currency_code;
    await db.none('UPDATE public."Cars" SET model = ${model}, manufacturer = ${manufacturer}, ps = ${ps}, price = ${price}, currency_code = ${currency_code}  WHERE id=${id}', {
        model: car.model,
        manufacturer: car.manufacturer, 
        ps: car.ps,
        price: car.price,
        currency_code: car.currency_code,
        id: car.id 
    });
    resp.json(car);
});
app.post("/cars", jsonParser, async (req, resp)=>{
    if(!req.body)
        resp.sendStatus(404);
    console.log(req.body);
    let car_model = req.body.model;
    let car_manufacturer = req.body.manufacturer;
    let car_ps = req.body.ps;
    let car_price = req.body.price;
    let car_currency_code = req.body.currency_code;

    await db.none('INSERT INTO public."Cars"(model, manufacturer, ps, price, currency_code) VALUES(${model}, ${manufacturer}, ${ps}, ${price}, ${currency_code})', {
        model: car_model,
        manufacturer: car_manufacturer, 
        ps: car_ps,
        price: car_price,
        currency_code: car_currency_code   
    });

    resp.json({model: car_model, manufacturer: car_manufacturer, ps: car_ps, price: car_price, currency_code: car_currency_code});
});

app.get("/cars", jsonParser, async (req, resp)=>{
    let data = await db.query('select * from "Cars";')
    console.log(data);
    resp.json(data);
});

app.listen(port, ()=>{
    console.log(`The server starts at port ${port}.`);
})
