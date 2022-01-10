/**
* @jest-environment jsdom
*/

import { screen, fireEvent} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import BillsUI from "../views/BillsUI.js";
import { ROUTES } from "../constants/routes";
import store from "../__mocks__/store";
import Store from "../app/Store";

window.localStorage.setItem("user",JSON.stringify({type: "Employee"}));
const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({ pathname });
};

describe("Given I am a user connected as Employee", () => {


  describe("When I'm on new bill form", () => {
    describe("When I click on submit button", () => {
      test("Then function handleSubmit should be called", () => {
        const html = NewBillUI();
        document.body.innerHTML = html;
        const newBill = new NewBill({ document,onNavigate,store: Store,localStorage: window.localStorage});

        const form = screen.getByTestId("form-new-bill");
        const handleSubmit = jest.fn(newBill.handleSubmit);
        form.addEventListener("submit", handleSubmit);
        fireEvent.submit(form);
        expect(handleSubmit).toHaveBeenCalled();
      })
    });

    describe("When I upload a file", () => {
      test("Then function handleChangeFile should be called", () => {
        const html = NewBillUI();
        document.body.innerHTML = html;
        const newBill = new NewBill({document, onNavigate, store: Store, localStorage: window.localStorage });
        const handleChangeFile = jest.fn(newBill.handleChangeFile);
        const file = screen.getByTestId("file");

        file.addEventListener("change", handleChangeFile);
        fireEvent.change(file, {
          target: {
            files: [new File(["image"], "test.png", { type: "image/png" })]
          }
        });
        expect(handleChangeFile).toHaveBeenCalled();
      });
    });
  })
});

// test d'intégration POST
describe("Given I am a user connected as employee", () => {
  describe("When I send a new Bill", () => {
    
    test("fetches bills from mock API POST", async () => {
      
      const getSpy = jest.spyOn(store, "post")
      const newBill = {
        "id": "47qAXb6fIm2zOKkLzMee",
        "vat": "80",
        "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
        "status": "pending",
        "type": "Hôtel et logement",
        "commentary": "séminaire billed",
        "name": "encore",
        "fileName": "preview-facture-free-201801-pdf-1.jpg",
        "date": "2004-04-04",
        "amount": 400,
        "commentAdmin": "ok",
        "email": "a@a",
        "pct": 20
      }

      const bills = await store.post(newBill);
      expect(getSpy).toHaveBeenCalledTimes(1)
      expect(bills.data.length).toBe(5)
    })
    test("fetches bills from an API 404", async () => {
      store.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API 500", async () => {
      store.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})