// This generates the content
document.addEventListener("readystatechange",(e)=>{
    if(document.readyState ==="complete"){
        const menu =document.querySelector(".menu");

        let requestData = (async ()=>{
            const request = await fetch('../data.json');
            const response = await request.json();
         
            return response
        })();
        
        let basket = (function(){
                        let selectedItem=[];
                        requestData.then((items)=>{
                            for(let item in items){
                                let {image,name,price}=items[item];
                                selectedItem.push({
                                    image,
                                    name,
                                    price,
                                    "qty":0
                                })
                            }
                        })
                        return selectedItem;
                    })();

        let generateMenuItems =(()=>{
            let addItems;
            requestData.then((items)=>{
                
                let fillMenu =items.map((item)=>{
                    let itemId =item.category.split(" ");
                    
                    let cate = itemId[0]

                    return  `<div class="menu-item" id="item_${cate}">
                                <div class="menu-img" tabIndex="0">
                                    <img src="${item.image.desktop}" alt="${item.name}" width="502" height="480">
                                    <button class="add" id ="${cate}">
                                        <img src="images/icon-add-to-cart.svg" alt="cart icon" class="cart">

                                        <span>Add to Cart</span>
                                    </button>
                                </div>
                                <h2 class="menu-heading">${itemId.join(" ")}</h2>
                                <h3 class="menu-subheading">${item.name}</h3>
                                <span class="menu-price">&dollar;${item.price.toFixed(2)}</span>
                            </div>`;
                    ;
                }).join("");
                
                menu.innerHTML = fillMenu;
        

                addItems = Array.from(menu.querySelectorAll(".add"));
                
                highlightClickedItem(addItems)
                })
        })();


        function highlightClickedItem(array){
            array.forEach((item)=>{
                if(!item.classList.contains("active")){
                    item.addEventListener("click",()=>{
                        item.closest(".menu-img").classList.add("active")
                        item.classList.add("active")
                        changeAddDisplay(item)
    
                    },{once:true})
                }
            })
        }
        

        function changeAddDisplay(item){
            item.innerHTML =`<div class="plus">
                                <img src=../dist/images/icon-increment-quantity.svg alt="increment-icon." >
                             </div>
                

                            <span class="itemQty">${0}</span>

                            <div class="minus">
                             <img src="../dist/images/icon-decrement-quantity.svg"             alt="decrement-icon." >
                            </div>                     
                            `
            addClickEventToOperators(Array.from(item.getElementsByClassName("plus")));
            addClickEventToOperators(Array.from(item.getElementsByClassName("minus")));

        }

        function addClickEventToOperators(elements){
            
            elements.forEach((element)=>{
                element.addEventListener("click",(e)=>{
                    e.stopPropagation();
                    let selectedId =e.target.closest(".menu-item").id;
                    let buttonId =selectedId.split("_")[1];

                    let qty = document.querySelector(`#${buttonId} .itemQty`);

                    let operation =e.target.alt.split("-")[0];
                    let item = getItemFromBasket(buttonId);

                    updateItemQtyInCart(buttonId,operation);

                    displaySelectedItemQty(qty,item.qty);

                    displayTotalQty(getTotal());

                    displayCartItems();

                    generateFooterContent()
                    
                })
            })
            
        }

        function updateItemQtyInCart(search,operation){

            let item  = getItemFromBasket(search);
            
            if(operation ==="increment"){
                item.qty+=1;
            }
            else{
                if(item.qty==0){
                    item.qty =0
                }
                else{
                    item.qty-=1;
                }
            }
        }

        function displaySelectedItemQty(element,qty){
            element.textContent = qty;
        }

        // This Uses The Name to check
        const getItemFromBasket =(search)=>{
            return basket.find((item)=>{
                return item.name.includes(search);
            })
        }

        function getTotal(){
            const arr =basket.map((item)=>{
                        return item.qty
                    });
            return arr.reduce((tot,nex)=> (tot+nex),0)
        }

        function displayTotalQty(total){
            const elem =document.querySelector("[data-totalQty]");

            elem.textContent =total;
        }

        function displayCartItems(){

            document.querySelector(".aside-img").style.display = "none";
            let arr =[];
            for(let item in basket){
                let {name,price,qty} =basket[item];
                arr.push({name,price,qty})
            }

            arr =arr.filter((item)=>{
                return item.qty !== 0;
            })

            const totalOrderAmount = (basket.filter((item)=>{
                return item.qty !=0;
            }).map(({qty,price})=>{
                return qty*price;
            }).reduce((total,next)=>total + next,0)).toFixed(2);

           arr = (arr.map((item)=>{
                return `
                    <div class="item">
                        <div class="item-detail">
                            <h2>${item.name}</h2>
                            <div>
                                <span class=item-qty>${item.qty}x</span>
                                <span class="item-price">@ $${item.price.toFixed(2)}</span>
                                <span class=item-total>$${(item.qty * item.price).toFixed(2)}</span>
                            </div>                     
                        </div>
                        <button class="cancelButton" aria-label="Remove Item">
                                <img src="../dist/images/icon-remove-item.svg" alt="Remove Button"/>
                        </button>

                        
                    </div>
                `
            })).join(" ")

            document.querySelector("[data-cartItems]").innerHTML = arr + `<div class=itemsTotal>
                            <span>Order Total</span>
                            <span class="totalOrder">$${totalOrderAmount}</span>
                        </div>`;

            removeItemFromCart(document.getElementsByClassName("cancelButton"))
        }

        function generateFooterContent(){
            const footer =document.querySelector(".aside footer");

            const flag =basket.filter((item)=>item.qty===0).length === 9;
            const aside =document.querySelector(".aside");
            if(flag){
                aside.innerHTML =`
                    <div class="container">
                        <h2 class="aside-h2">Your Cart(<span class="qty" data-totalQty >0</span>)</h2>
                        <div class="aside-img">
                            <img src="../dist/images/illustration-empty-cart.svg" alt="">
                        </div>
                        <div data-cartItems></div>
                    <footer>
                        <p class="aside-p">Your added Items will appear here</p>
                    </footer>
                    </div>
                `
            }
            else{
                footer.innerHTML =`
                <p class=footer-p>
                    <img src="../dist/images/icon-carbon-neutral.svg" alt="">
                    <span> This is a<span class=carbon> carbon-neutral </span> delievery
                    </span>
                </p>
                <button class=confirmButton>Confirm Order</button>
                `
            }
           

            clickConfirm();

            
        }

        function removeItemFromCart(items){
            for(let item of items){
                item.addEventListener("click",(e)=>{
                    e.stopPropagation();
                    const nameHeader = e.target.closest(".item").querySelector("h2").textContent;

                    
                    let item =getItemFromBasket(nameHeader);

                    item.qty =0

                    
                   displayCartItems();
                   generateFooterContent();
                   displayTotalQty(getTotal());

                //    change the qty to zero   
                    checkmenuItemWithId(nameHeader,item.qty);
                })
            }
        }

        function checkmenuItemWithId(id,qty){
            const menuItems = Array.from(document.getElementsByClassName("menu-item"));
            
            for(let item in menuItems){
                
                if(menuItems[item].querySelector(".menu-subheading").textContent.includes(id)){
                    menuItems[item].querySelector(".itemQty").textContent = qty;
                }
            }
        }

        function clickConfirm(){
            const confirmButton =document.querySelector(".confirmButton");

            confirmButton.addEventListener("click",()=>{
                
            })
        }

    }    
})
