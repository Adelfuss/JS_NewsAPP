document.addEventListener("DOMContentLoaded", function(){
   M.AutoInit();
   loadNews();
});

const formElement = document.forms.newsControls;
const selectCountryElement = formElement.elements.country;
const searchTopicElement = formElement.elements.search;
formElement.addEventListener("submit",function(event){
  event.preventDefault();
  loadNews();
});
const httpQueriesTypes = (function(){
   return {
     get(url,cb) {
       try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.addEventListener("load", function(){
            if (Math.floor(xhr.status / 100) !== 2){
                cb(`Server query Error ${xhr.status}`,xhr);
                return;
            }
            const response = JSON.parse(xhr.response);
            cb(null,response);
        });
        xhr.addEventListener("error",function(){
            cb(`Server connection error ${xhr.status}`,xhr);
        });
        xhr.send();
       }
       catch(error) {
        showErrorMessage(error);
       }
     },
     post(url,headers,body,cb){
         
     },
   } 
})();

const appModule = (function(){
  const apiKey = `c7bd6173c5284be8b9145b20a1c32cb2`;
  const apiUrl = `https://news-api-v2.herokuapp.com`;
  return {
     topHeadlined(country = 'ua',cb){
         httpQueriesTypes.get(`${apiUrl}/top-headlines?country=${country}&apiKey=${apiKey}`,cb);
     },
     everything(query,cb){
          httpQueriesTypes.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`,cb);
     }
  };
})();

function loadNews() {
   startLoading();
   const searchTopicValue = searchTopicElement.value;
   const selectCountryValue = selectCountryElement.value;
   if (!searchTopicValue) {
     appModule.topHeadlined(selectCountryValue,onGetHandler);
   }
   else {
     appModule.everything(searchTopicValue,onGetHandler);
   }
}

function startLoading(){
  document.body.insertAdjacentHTML("afterbegin",`
  <div class="progress">
  <div class="indeterminate"></div>
  </div>
  `);
}

function removeLoading(){
   const loadElement = document.querySelector(".progress");
   loadElement.remove();
}

function onGetHandler(err,res){
   removeLoading();
   if (err){
     showErrorMessage(err);
     return;
   }
   const container = document.querySelector('.grid-container');
   container.innerHTML = '';
   const finalResponse = res.articles;
   //console.log(res);
   let news = '';
   finalResponse.forEach(function(newsItem){
       news += renderNews(newsItem);
   });
   container.insertAdjacentHTML("afterbegin",news);
}

function showErrorMessage(msg, type = 'success'){
  M.toast({html:msg,classes: type});
}

function renderNews({urlToImage,title,url,description} = news){
    return `
    <div class="col s12">
    <div class="card">
     <div class="card-image">
      <img src="${urlToImage}">
      <span class="card-title">${title || ''}</span>
      <div class="card-content">
       <p>${description || ""}</p>
      </div>
      <div class="card-action">
       <a href="${url}">Read more</a>
      </div>
     </div>
    </div>
   </div>
    `;
}

