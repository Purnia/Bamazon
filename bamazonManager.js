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
    inquirer
        .prompt([
            {
                name: "choice",
                type: "list",
                choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"],
                message: "type in the id of the item you would like to buy?"

            }
        ])
        .then(function (response) {
            if (response.choice === "View Products for Sale") {
                viewProducts();
            }
            else if (response.choice === "View Low Inventory") {
                viewInventory();
            }
            else if (response.choice === "Add to Inventory") {
                addInventory();
            }
            else {
                addProduct();
            }
        });
};

function viewProducts() {
    connection.query("SELECT * FROM products", function (err, res) {

        for (var i = 0; i < res.length; i++) {
            console.log("Product Name: " + res[i].product_name, "Product ID: " + res[i].item_id, "Product Price: " + res[i].price, "Product Quantity " + res[i].stock_quantity);
        }
        if (err) throw err;
    })
};

function viewInventory() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            if (res[i].stock_quantity < 5) {
                console.log("The following items have a low stock: " + res[i].product_name, res[i].stock_quantity);
            }
        }
    })
};

function addInventory() {
    connection.query("SELECT * FROM products", function (err, res) {

        for (var i = 0; i < res.length; i++) {
            console.log("Product Name: " + res[i].product_name, "Product ID: " + res[i].item_id, "Product Price: " + res[i].price, "Product Quantity " + res[i].stock_quantity);
        }
        if (err) throw err;


        inquirer
            .prompt([
                {
                    name: "items",
                    type: "input",
                    message: "enter the id of the item you would like to add to"
                },
                {
                    name: "itemQuantity",
                    type: "input",
                    message: "How much quantity would you like to add?"
                }
            ])
            .then(function (response) {
                var itemID = parseInt(response.items);
                var itemQuantity = parseInt(response.itemQuantity);
                var chosenItem;
                for (var i = 0; i < res.length; i++) {
                    if (res[i].item_id === itemID) {
                        chosenItem = res[i];
                    }
                }


                connection.query(
                    "UPDATE products SET ? WHERE ?",
                    [
                        {
                            stock_quantity: chosenItem.stock_quantity + itemQuantity
                        },
                        {
                            item_id: itemID
                        }
                    ],
                    function (error) {
                        if (error) throw err;
                        console.log("Your items have been successfully added!");
                        start();
                    }
                )

            })
    });

}

function addProduct() {
    inquirer
        .prompt([
            {
                name: "productName",
                type: "input",
                message: "Add the name of the product you would like to add"
            },
            {
                name: "departmentName",
                type: "input",
                message: "Add the name of the department you would like to add the product to"
            },
            {
                name: "price",
                type: "input",
                message: "Add the price of the product you would like to add"
            },
            {
                name: "quantity",
                type: "input",
                message: "Add the quantity of the product you would like to add"
            },
        ])
        .then(function (response) {
            var productName = response.productName;
            var departmentName = response.departmentName;
            var productPrice = response.price;
            var quantity = response.quantity;

            function createProduct() {
                var query = connection.query(
                    "INSERT INTO products SET ?",
                    {
                        product_name: productName,
                        department_name: departmentName,
                        price: productPrice,
                        stock_quantity: quantity
                    },
                    function (err, res) {
                        console.log(res.affectedRows + " product inserted!\n");
                    }
                );

                // logs the actual query being run
                console.log(query.sql);
            }
            createProduct();
        })


}