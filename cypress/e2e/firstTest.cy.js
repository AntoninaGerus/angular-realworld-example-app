/// <reference types="cypress" />

describe("test with backend", () => {
  beforeEach("login to the app", () => {
    // cy.intercept(
    //   { method: "GET", path: "tags" },
    //   {
    //     fixture: "tags.json",
    //   }
    // );
    cy.loginToApplication();
  });

  it("verify correct request and response", () => {
    cy.intercept("POST", "https://api.realworld.io/api/articles").as(
      "postArticles"
    );

    cy.contains("New Article").click();
    cy.get('[formcontrolname="title"]').type("title14.11.22 01");
    cy.get('[formcontrolname="description"]').type("description14.11.22 01");
    cy.get('[formcontrolname="body"]').type("body14.11.22 01");
    cy.contains("Publish Article").click();

    cy.wait("@postArticles").then((xhr) => {
      console.log("*****************************", xhr);
      expect(xhr.response.statusCode).to.equal(200);
      expect(xhr.request.body.article.body).to.equal("body14.11.22 01");
      expect(xhr.request.body.article.description).to.equal(
        "description14.11.22 01"
      );
    });
  });

  it("verify popular tags are dispayed", () => {
    cy.get(".tag-list")
      .should("contain", "new")
      .and("contain", "tags")
      .and("contain", "example");
  });

  it("verify global feed likes count", () => {
    cy.intercept("GET", "https://api.realworld.io/api/articles/feed*", {
      articles: [],
      articlesCount: 0,
    });
    cy.intercept("GET", "https://api.realworld.io/api/articles*", {
      fixture: "articles.json",
    });
    cy.contains("Global Feed").click();
    cy.get("app-article-list button").then((heartCount) => {
      expect(heartCount[0]).to.contain("1");
      expect(heartCount[1]).to.contain("5");
    });

    cy.fixture("articles").then((file) => {
      const articleLink = file.articles[1].slug;
      file.articles[1].favoritesCount = 6;
      cy.intercept(
        "POST",
        " https://api.realworld.io/api/articles/'+articleLink+'/favorite",
        file
      );
      cy.get("app-article-list button").eq(1).click().should("contain", "6");
    });
  });

  it("intercepting and modifying the request and response", () => {
    // cy.intercept("POST", "https://api.realworld.io/api/articles/", (req) => {
    //   req.body.article.description = "new description9";
    // }).as("postArticles");

    cy.intercept("POST", "https://api.realworld.io/api/articles/", (req) => {
      req.reply((res) => {
        expect(res.body.article.description).to.equal("description17.11.22 1");
        res.body.article.description = "new description1";
      });
    }).as("postArticles");

    cy.contains("New Article").click();
    cy.get('[formcontrolname="title"]').type("title17.11.22 1");
    cy.get('[formcontrolname="description"]').type("description17.11.22 1");
    cy.get('[formcontrolname="body"]').type("body17.11.22 1");
    cy.contains("Publish Article").click();

    cy.wait("@postArticles").then((xhr) => {
      console.log("*****************************", xhr);
      expect(xhr.response.statusCode).to.equal(200);
      expect(xhr.request.body.article.body).to.equal("body17.11.22 1");
      expect(xhr.response.body.article.description).to.equal(
        "new description1"
      );
    });
  });

  it.only("delete a new article in a global feed", () => {
    const bodyRequest = {
      article: {
        tagList: [],
        title: "some title",
        description: "some description",
        body: "some body",
      },
    };
    cy.get("@token").then((token) => {
      cy.request({
        url: Cypress.env("apiUrl") + "/api/articles/",
        headers: { Authorization: "Token " + token },
        method: "POST",
        body: bodyRequest,
      }).then((response) => {
        expect(response.status).to.equal(200);
      });

      cy.contains("Global Feed").click();
      cy.get(".article-preview").first().click();
      cy.get(".article-actions").contains("Delete Article").click();

      cy.request({
        url: Cypress.env("apiUrl") + "/api/articles?limit=10&offset=0",
        headers: { Authorization: "Token " + token },
        method: "GET",
      })
        .its("body")
        .then((body) => {
          cy.wait(20);
          expect(body.articles[0].title).not.to.equal("some title");
        });
    });
  });
});
