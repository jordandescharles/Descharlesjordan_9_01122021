/**
* @jest-environment jsdom
*/

import { screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH } from '../constants/routes.js'
import { localStorageMock } from "../__mocks__/localStorage.js"
import Router from "../app/Router.js"
import Bills from "../containers/Bills.js";
import StoreMock from "../__mocks__/store";


describe("Given I am connected as an employee", () => {
 
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {

       // on precise l'user type employee
      Object.defineProperty(window, "localStorage", {value: localStorageMock,});
      window.localStorage.setItem("user",JSON.stringify({type: "Employee",}));
      // on choisis la page bills pour le test
      Object.defineProperty(window, "location", { value: { hash: ROUTES_PATH["Bills"] } });
      // creation d une div vide pour  utiliser router comme dans l'index
      document.body.innerHTML = `<div id="root"></div>`;
      // on lance la methode qui verifie le path pour savoir ce qui est actif
      Router();
      // on localise la div qui nous interesse
      const divBillIcon = screen.queryByTestId("icon-window")
      // on verifie que la classe active est présente
      expect(divBillIcon.classList.contains("active-icon")).toBe(true)

    })
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  

    describe("And I click on the eye icon", () => {
        test("A modal should open", () => {
          const html = BillsUI({ data: bills })
          document.body.innerHTML = html      
          // on utilise le contructeur Bills    
          const testBills = new Bills({
            document,
            onNavigate,
            localStorage: window.localStorage,
          });
          // fonction simulée handleClickIconEye afin de tester le bouton
          testBills.handleClickIconEye = jest.fn()
          // simule le click sur le bouton
          screen.getAllByTestId("icon-eye")[0].click()
          expect(testBills.handleClickIconEye).toBeCalled()
        });
      });
      
  })

  // test API
  describe("When Im on Bills UI", () => {
    test("get bills from  API ", async () => {
      const getSpyon = jest.spyOn(StoreMock, "get");
      const bills = await StoreMock.get();
      expect(getSpyon).toHaveBeenCalledTimes(1);
      // on veux qu il y ai 4 appels comme le nopmbre objets dans store
      expect(bills.data.length).toBe(4);
    });
    test("get bills from an API  but 404", async () => {
      // permet de creer une erreur avant la promesse
      StoreMock.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      );
      // on affiche l erreur
      const html = BillsUI({ error: "Erreur 404" });
      document.body.innerHTML = html;
      // on attends l alerte
      const alert = screen.getByText(/Erreur 404/);
      expect(alert).toBeTruthy();
    });
    test("get messages from an API but 500", async () => {
      StoreMock.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      );
      const html = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = html;
      const alert = screen.getByText(/Erreur 500/);
      expect(alert).toBeTruthy();
    });
  });
})


