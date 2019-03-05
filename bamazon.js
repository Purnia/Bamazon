var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "password", //can you/should you hide this?
    database: "bamazon_DB"
});

// connect to the mysql server and sql database
connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    // run the start function after the connection is made to prompt the user
    start();
});



function start() {
    // query the database for all items being auctioned
    connection.query("SELECT * FROM products", function (err, results) {
         //difference between console log and trturn and which should i use
        for(var i=0; i<results.length; i++){
            console.log("Product Name: " + results[i].product_name, "Product ID: " + results[i].item_id, "Product Price: " + results[i].price);
        }
        if (err) throw err;
        // once you have the items, prompt the user for which they'd like to bid on
        inquirer
            .prompt([
                {
                    name: "choice",
                    type: "input",
                    message: "type in the id of the item you would like to buy?"

                },
                {
                    name: "productQuantity",
                    type: "input",
                    message: "How much would you like to buy?"
                }
            ])
            .then(function (response) {
                var productID = parseInt(response.choice);
                var productQuantity = parseInt(response.productQuantity);
                var chosenProduct;
                for (var i = 0; i < results.length; i++) {
                    if (results[i].item_id === productID) {
                        chosenProduct = results[i];
                    }
                }

                //determine if quanity is enough
                
                if (chosenProduct.stock_quantity > productQuantity) {
                    //if enough then do math, let user know total and update db
                    connection.query(
                    "UPDATE products SET ? WHERE ?",
                    [
                        {
                            stock_quantity: chosenProduct.stock_quantity - productQuantity //figuring out how to update this. dont think its picking up numeric values
                        },
                        {
                            item_id: productID
                        }
                    ],
                    function(error){
                        if(error) throw err;
                        console.log("Your purchase was successful!");
                        console.log("Your total amount payable is " +"$"+ chosenProduct.price * productQuantity);
                        start();
                    }

                    );
                }
                    else {
                        //if not enough quantity available
                        console.log("Insufficient quantity available");
                        start();

                    }
            });
        

    }
    )
}

