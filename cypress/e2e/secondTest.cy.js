describe("test log out", () => {
  beforeEach("login to the app", () => {
    cy.loginToApplication();
  });

  it("verify logging out", () => {
    cy.contains("Settings").click();
    cy.contains("Or click here to logout").click();
    cy.get(".navbar-nav").should("contain", "Sign up");
  });
});
