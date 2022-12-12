import React, { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  set,
  ref,
  push,
  child,
  onValue,
  off,
  remove,
  update,
  increment,
} from "@firebase/database";
import { db } from "../../Firebase/firebase";
import { AuthContext } from "../../context/Context";
import {
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Typography,
} from "@mui/material";
import moment from "moment";
import EnhancedTable from "../Table/Table";
import Form from "../Form/Form";
import AddIcon from "@mui/icons-material/Add";

function Sales() {
  const { user } = useContext(AuthContext);
  const [formPopupSales, setFormPopupSales] = useState(false);
  const [formPopupEdit, setFormPopupEdit] = useState(false);

  //Edit Form
  const [editKey, setEditKey] = useState("");
  const [editIndex, setEditIndex] = useState(0);

  //Retrieve list of Sales
  const [salesList, setSalesList] = useState([]);

  //Retrive list of existing Parts
  const [partsList, setPartsList] = useState({});
  const [partsNameList, setPartsNameList] = useState([]);
  const [filteredPartsNames, setFilteredPartsNames] = useState([]);

  //User preferences
  const [userPreferences, setUserPreferences] = useState({
    onlyCountDelivered: false,
    requireInventory: false,
    showAllParts: true,
    countAllForUnitPrice: true,
  });

  //Sales Form
  const [salesInputList, setSalesInputList] = useState([
    {
      quantityInput: [
        0,
        {
          inputType: "number",
          inputTitle: "Quantity",
          gridSize: 3,
        },
      ],
      partInput: [
        "",
        {
          inputType: "autocomplete",
          inputTitle: "Part",
          inputOptions: userPreferences.requireInventory
            ? filteredPartsNames
            : partsNameList,
          gridSize: 4,
        },
      ],
      priceInput: [
        0,
        {
          inputType: "number",
          inputTitle: "Total Price",
          gridSize: 3,
        },
      ],
    },
  ]);
  const [buyer, setBuyer] = useState("");
  const [saleDate, setSaleDate] = useState(moment().format("yyyy-MM-DD"));

  useEffect(() => {
    let tmpInputList = salesInputList;
    tmpInputList.forEach((input) => {
      input.partInput[1].inputOptions = userPreferences.requireInventory
        ? filteredPartsNames
        : partsNameList;
    });

    setSalesInputList(tmpInputList);
  }, [filteredPartsNames, partsNameList, userPreferences, salesInputList]);

  const history = useNavigate();

  const showSalesForm = useCallback(() => {
    setFormPopupSales(true);
  }, []);

  const hideSalesForm = useCallback(() => {
    setFormPopupSales(false);
    if (formPopupSales) {
      setSalesInputList([
        {
          quantityInput: [
            0,
            {
              inputType: "number",
              inputTitle: "Quantity",
              gridSize: 3,
            },
          ],
          partInput: [
            "",
            {
              inputType: "autocomplete",
              inputTitle: "Part",
              inputOptions: userPreferences.requireInventory
                ? filteredPartsNames
                : partsNameList,
              gridSize: 4,
            },
          ],
          priceInput: [
            0,
            {
              inputType: "number",
              inputTitle: "Total Price",
              gridSize: 3,
            },
          ],
        },
      ]);
      setBuyer("");
      setSaleDate(moment().format("yyyy-MM-DD"));
    }
  }, [formPopupSales, filteredPartsNames, partsNameList, userPreferences]);

  const showEditForm = useCallback(() => {
    setFormPopupEdit(true);
  }, []);

  const hideEditForm = useCallback(() => {
    setFormPopupEdit(false);
    if (formPopupEdit) {
      setSalesInputList([
        {
          quantityInput: [
            0,
            {
              inputType: "number",
              inputTitle: "Quantity",
              gridSize: 3,
            },
          ],
          partInput: [
            "",
            {
              inputType: "autocomplete",
              inputTitle: "Part",
              inputOptions: userPreferences.requireInventory
                ? filteredPartsNames
                : partsNameList,
              gridSize: 4,
            },
          ],
          priceInput: [
            0,
            {
              inputType: "number",
              inputTitle: "Total Price",
              gridSize: 3,
            },
          ],
        },
      ]);
      setBuyer("");
      setSaleDate(moment().format("yyyy-MM-DD"));
    }
  }, [formPopupEdit, filteredPartsNames, partsNameList, userPreferences]);

  useEffect(() => {
    onValue(ref(db, "sales/" + user?.uid + "/"), (snapshot) => {
      let list = [];
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        data["key"] = childSnapshot.key;
        list = [...list, data];
      });
      setSalesList(list);
    });
    onValue(ref(db, "parts/" + user?.uid + "/"), (snapshot) => {
      var partAssociation = partsList;
      let nameList = [""];
      let filteredNameList = [""];
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        data["key"] = childSnapshot.key;
        partAssociation[data.Name] = data;
        nameList = [...nameList, data.Name];
        if (parseInt(data.Quantity) > 0) {
          filteredNameList = [...filteredNameList, data.Name];
        }
      });
      setPartsList(partAssociation);
      setPartsNameList(nameList);
      setFilteredPartsNames(filteredNameList);
    });
    onValue(ref(db, "userpreferences/" + user?.uid), (snapshot) => {
      setUserPreferences(snapshot.val());
    });
    return () => {
      off(ref(db, "sales/" + user?.uid + "/"));
      off(ref(db, "parts/" + user?.uid + "/"));
    };
  }, [user, partsList, history]);

  const handleSalesEditClick = useCallback(
    (editData, editIndex) => {
      setEditKey(editData.key);
      setEditIndex(editIndex);

      let list = [];
      editData.Parts.forEach((part) => {
        list = [
          ...list,
          {
            quantityInput: [
              part.Quantity,
              {
                inputType: "number",
                inputTitle: "Quantity",
                gridSize: 3,
              },
            ],
            partInput: [
              part.PartName,
              {
                inputType: "autocomplete",
                inputTitle: "Part",
                inputOptions: userPreferences.requireInventory
                  ? filteredPartsNames
                  : partsNameList,
                gridSize: 4,
              },
            ],
            priceInput: [
              part.Price,
              {
                inputType: "number",
                inputTitle: "Total Price",
                gridSize: 3,
              },
            ],
          },
        ];
      });

      setSalesInputList(list);
      setBuyer(editData.Buyer);
      setSaleDate(editData.SaleDate);

      showEditForm();
    },
    [showEditForm, filteredPartsNames, partsNameList, userPreferences]
  );

  const handleSalesDeleteClick = useCallback(
    (editIndex, editKey) => {
      salesList[editIndex].Parts.forEach((x) => {
        update(ref(db, "parts/" + user?.uid + "/" + x.PartKey), {
          Quantity: increment(x.Quantity),
          soldPrice: increment(-x.Price),
          soldQuantity: increment(-x.Quantity),
        });
      });
      remove(ref(db, "sales/" + user?.uid + "/" + editKey));
    },
    [salesList, user]
  );

  const handleAddClick = () => {
    setSalesInputList([
      ...salesInputList,
      {
        quantityInput: [
          0,
          {
            inputType: "number",
            inputTitle: "Quantity",
            gridSize: 3,
          },
        ],
        partInput: [
          "",
          {
            inputType: "autocomplete",
            inputTitle: "Part",
            inputOptions: userPreferences.requireInventory
              ? filteredPartsNames
              : partsNameList,
            gridSize: 4,
          },
        ],
        priceInput: [
          0,
          {
            inputType: "number",
            inputTitle: "Total Price",
            gridSize: 3,
          },
        ],
      },
    ]);
  };

  const handleRemoveClick = (index) => {
    const list = [...salesInputList];
    list.splice(index, 1);
    setSalesInputList(list);
  };

  const handleInputChange = useCallback(
    (name, value, index) => {
      const list = [...salesInputList];
      list[index][name][0] = value;
      setSalesInputList(list);
    },
    [salesInputList]
  );

  const parseSaleFormIntoDb = useCallback(
    (buyer, saleDate, salesInputList, edit) => {
      if (edit) {
        salesList[editIndex].Parts.forEach((x, i) => {
          update(ref(db, "parts/" + user?.uid + "/" + x.PartKey), {
            Quantity: increment(salesList[editIndex].Parts[i].Quantity),
            soldPrice: increment(-salesList[editIndex].Parts[i].Price),
            soldQuantity: increment(-salesList[editIndex].Parts[i].Quantity),
          });
        });
        remove(ref(db, "sales/" + user?.uid + "/" + editKey));
        hideEditForm();
      } else hideSalesForm();

      const data = {
        Buyer: buyer,
        SaleDate: moment(saleDate).format("yyyy-MM-DD"),
        Parts: salesInputList.map((x) => {
          let partKey;

          if (!partsNameList.includes(x.partInput[0])) {
            partKey = push(child(ref(db), "parts/" + user?.uid + "/")).key;
            set(ref(db, "parts/" + user?.uid + "/" + partKey), {
              Name: x.partInput[0],
              Quantity: -parseInt(x.quantityInput[0]),
              Type: "",
              SubType: "",
              purchasedPrice: 0.0,
              purchasedQuantity: 0,
              Notes: "",
              soldPrice: parseFloat(x.priceInput[0]),
              soldQuantity: parseInt(x.quantityInput[0]),
            });
          } else {
            partKey = partsList[x.partInput[0]].key;
            update(ref(db, "parts/" + user?.uid + "/" + partKey), {
              Quantity: increment(-parseInt(x.quantityInput[0])),
              soldPrice: increment(parseFloat(x.priceInput[0])),
              soldQuantity: increment(parseInt(x.quantityInput[0])),
            });
          }

          return {
            Quantity: parseInt(x.quantityInput[0]),
            PartName: x.partInput[0],
            Price: parseFloat(x.priceInput[0]),
            PartKey: partKey,
          };
        }),
      };

      const newSaleKey = push(child(ref(db), "sales/" + user?.uid + "/")).key;
      set(ref(db, "sales/" + user?.uid + "/" + newSaleKey), data);
    },
    [
      user,
      partsList,
      partsNameList,
      salesList,
      editIndex,
      editKey,
      hideEditForm,
      hideSalesForm,
    ]
  );

  const [salesHeadcells] = useState([
    {
      id: "Buyer",
      disablePadding: true,
      orderable: true,
      label: "Buyer",
    },
    {
      id: "Quantity",
      disablePadding: false,
      orderable: false,
      label: "Product Quantity",
    },
    {
      id: "PartName",
      disablePadding: false,
      orderable: false,
      label: "Product Name",
    },
    {
      id: "Price",
      disablePadding: false,
      orderable: false,
      label: "Total Price",
    },
    {
      id: "SaleDate",
      disablePadding: false,
      orderable: true,
      label: "Sale Date",
    },
  ]);

  const [keyOrderSales] = useState([
    ["Buyer", "string"],
    ["Parts", "nested"],
    ["SaleDate", "string"],
  ]);
  const [searchOptionsSales] = useState(["Buyer", "Parts"]);

  const [filterOptionsSales, setFilterOptionsSales] = useState({
    SaleDate: ["date", []],
  });

  useEffect(() => {
    setFilterOptionsSales({
      SaleDate: ["date", []],
    });
  }, [salesList]);

  const [inputFieldsSales, setInputFieldsSales] = useState([
    {
      inputType: "textfield",
      inputTitle: "Buyer",
      gridSize: 6,
      inputSetStateFn: setBuyer,
      currentValue: buyer,
      isRequired: true,
    },
    {
      inputType: "date",
      inputTitle: "Sale Date",
      gridSize: 6,
      inputSetStateFn: setSaleDate,
      currentValue: saleDate,
      isRequired: false,
    },
    {
      inputType: "dynamic",
      inputTitle: "PartArray",
      currentValue: salesInputList,
      inputSetStateFn: handleInputChange,
      gridSize: 12,
      isRequired: true,
    },
  ]);

  useEffect(() => {
    setInputFieldsSales([
      {
        inputType: "textfield",
        inputTitle: "Buyer",
        gridSize: 6,
        inputSetStateFn: setBuyer,
        currentValue: buyer,
        isRequired: true,
      },
      {
        inputType: "date",
        inputTitle: "Sale Date",
        gridSize: 6,
        inputSetStateFn: setSaleDate,
        currentValue: saleDate,
        isRequired: false,
      },
      {
        inputType: "dynamic",
        inputTitle: "PartArray",
        currentValue: salesInputList,
        inputSetStateFn: handleInputChange,
        gridSize: 12,
        isRequired: true,
      },
    ]);
  }, [buyer, saleDate, salesInputList, handleInputChange]);

  return (
    <Grid
      container
      spacing={2}
      justifyContent="center"
      alignItems="center"
      sx={{ pl: 5, pr: 5, height: "100%" }}
    >
      <Grid item xs={12} id="salesTable" sx={{ height: "100%" }}>
        <Card elevation={5} sx={{ height: "100%" }}>
          {salesList.length !== 0 ? (
            <CardHeader
              title="Sales"
              action={
                <Button variant="contained" onClick={showSalesForm}>
                  <AddIcon />
                </Button>
              }
            />
          ) : (
            <CardHeader title="Sales" />
          )}
          <CardContent>
            {salesList.length !== 0 ? (
              <EnhancedTable
                defaultOrderBy=""
                tableData={salesList}
                tableHeadcells={salesHeadcells}
                editFunction={handleSalesEditClick}
                deleteFunction={handleSalesDeleteClick}
                keyOrder={keyOrderSales}
                isEditable={true}
                isDeletable={true}
                searchOptions={searchOptionsSales}
                filterOptions={filterOptionsSales}
              />
            ) : (
              <Grid
                container
                spacing={2}
                direction="column"
                justifyContent="center"
                alignItems="center"
                sx={{
                  height: "60vh",
                  width: "100%",
                }}
              >
                <Grid item>
                  <Typography variant="h5">
                    You have no Sales currently...
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="h6">
                    Click the button to add your first!
                  </Typography>
                </Grid>
                <Grid item>
                  <Button variant="contained" onClick={showSalesForm}>
                    <AddIcon />
                  </Button>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>
      </Grid>

      {formPopupSales && (
        <Form
          openBool={formPopupSales}
          onCloseFn={hideSalesForm}
          onSubmitFn={(editBool) => {
            parseSaleFormIntoDb(buyer, saleDate, salesInputList, editBool);
          }}
          inputFields={inputFieldsSales}
          formTitle="Sales"
          editBool={false}
          userPreferences={userPreferences}
          dynamicAdd={handleAddClick}
          dynamicRemove={handleRemoveClick}
        />
      )}

      {formPopupEdit && (
        <Form
          openBool={formPopupEdit}
          onCloseFn={hideEditForm}
          onSubmitFn={(editBool) => {
            parseSaleFormIntoDb(buyer, saleDate, salesInputList, editBool);
          }}
          inputFields={inputFieldsSales}
          formTitle="Sales"
          editBool={true}
          userPreferences={userPreferences}
          dynamicAdd={handleAddClick}
          dynamicRemove={handleRemoveClick}
        />
      )}
    </Grid>
  );
}

export default Sales;
