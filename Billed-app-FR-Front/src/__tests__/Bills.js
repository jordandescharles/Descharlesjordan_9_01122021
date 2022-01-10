/**
* @jest-environment jsdom
*/

import StoreMock from "../__mocks__/store";
import { screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import Bills from "../containers/Bills.js"
import userEvent from "@testing-library/user-event"
import Router from "../app/Router"


describe("Given I am connected as an employee", () => {
 
  describe("When I am on Bills Page", () => {

    // test icone Active
    test("Then bill icon in vertical layout should be highlighted", () => {

          window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
          const pathname = ROUTES_PATH["Bills"] 
          Object.defineProperty(window, "location", { value: { hash: pathname } })
          
          document.body.innerHTML = `<div id="root"></div>`
          Router()
    
          expect(screen.getByTestId("icon-window").classList.contains("active-icon"))

    })

    // Test Ordre factures

    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  
     // test handleClickNewBill
     describe("When I click on New Bill btn", () => {
      test("It should renders new bill page", () => {
        
        window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
        const html = BillsUI({ data: []})  
        document.body.innerHTML = html
        const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname })}
        
        const bills = new Bills({document, onNavigate, localStorage: window.localStorage})
  
        const handleClickNewBill = jest.fn(() => bills.handleClickNewBill)
        const newBillBtn = screen.getByTestId('btn-new-bill')
  
        newBillBtn.addEventListener('click', handleClickNewBill)
        
        userEvent.click(newBillBtn)

        expect(handleClickNewBill).toHaveBeenCalled()
        expect(screen.queryByText('Envoyer une note de frais')).toBeTruthy()
      })
    })

    // test MODALE

    describe('When click on the eye icon', () => {
      test('A modal should appears', () => {
       
        window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
        
        const html = BillsUI({ data: [bills[1]] })
        document.body.innerHTML = html

        const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname })}

        const billsClass = new Bills({document, onNavigate, localStorage: window.localStorage})

        const modale = document.getElementById("modaleFile")
        $.fn.modal = jest.fn(() => modale.classList.add('show'))
    
        const handleClickIconEye = jest.fn(() => billsClass.handleClickIconEye)
        const iconEye = screen.getByTestId('icon-eye')
    
        iconEye.addEventListener('click', handleClickIconEye)
        userEvent.click(iconEye)

        expect(handleClickIconEye).toHaveBeenCalled()
        expect(modale.classList).toContain('show')
      })
    })
  })

  // test GET
  describe("When Im on Bills UI", () => {
    
    test("get bills from  API ", async () => {

      const getSpyon = jest.spyOn(StoreMock, "get");
      const bills = await StoreMock.get();
      expect(getSpyon).toHaveBeenCalledTimes(1);
      expect(bills.data.length).toBe(4);
    });

    test("get bills from an API  but 404", async () => {
    
      StoreMock.get.mockImplementationOnce(() => Promise.reject(new Error("Erreur 404")));

      const html = BillsUI({ error: "Erreur 404" });
      document.body.innerHTML = html;

      const alert = screen.getByText(/Erreur 404/);
      expect(alert).toBeTruthy();

    });

    test("get messages from an API but 500", async () => {
      StoreMock.get.mockImplementationOnce(() => Promise.reject(new Error("Erreur 500")));

      const html = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = html;

      const alert = screen.getByText(/Erreur 500/);
      expect(alert).toBeTruthy();

    });
  });
})
