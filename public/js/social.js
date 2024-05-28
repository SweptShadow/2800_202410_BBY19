document.addEventListener("DOMContentLoaded", async function () {
    try {
      const response = await fetch("/api/friends");
      const friends = await response.json();
      console.log(friends);
  
      const friendsCardsContainer = document.getElementById("friends-cards");
      friends.forEach(async friend => {
        let pfp = friend.pfp
        if (!pfp) {
          pfp = "/images/stock.jpg";
        }
        const card = document.createElement("div");
        card.className = "col-12 col-sm-6 col-lg-3";
        card.innerHTML = `
          <div class="single_advisor_profile wow fadeInUp" data-wow-delay="0.2s" style="visibility: visible; animation-delay: 0.2s; animation-name: fadeInUp;">
            <div class="advisor_thumb">
              <img src="${pfp}" alt="Profile Picture">
            </div>
            <div class="single_advisor_details_info">
              <h6>${friend.username}</h6>
            </div>
          </div>
        `;
        console.log("here")
        friendsCardsContainer.appendChild(card);
      });
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  });
  