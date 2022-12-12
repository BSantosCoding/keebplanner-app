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
import { db } from "./../../Firebase/firebase";
import { AuthContext } from "./../../context/Context";
import {
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Typography,
} from "@mui/material";
import moment from "moment";
import EnhancedTable from "./../Table/Table";
import Form from "./../Form/Form";
import AddIcon from "@mui/icons-material/Add";

function Purchases() {
  const { user } = useContext(AuthContext);
  const [formPopupPurchases, setFormPopupPurchases] = useState(false);
  const [formPopupEdit, setFormPopupEdit] = useState(false);

  //Edit Form
  const [editKey, setEditKey] = useState("");
  const [editIndex, setEditIndex] = useState(0);

  //Retrieve list of Purchases
  const [purchasesList, setPurchasesList] = useState([]);

  //Retrive list of existing Parts
  const [partsList, setPartsList] = useState({});
  const [partsNameList, setPartsNameList] = useState([]);

  //Retrive classification options
  const [statusOptions, setStatusOptions] = useState([]);
  const [buyTypeOptions, setBuyTypeOptions] = useState([]);

  //User preferences
  const [userPreferences, setUserPreferences] = useState({
    onlyCountDelivered: false,
    requireInventory: false,
    showAllParts: true,
    countAllForUnitPrice: true,
  });

  //Purchases Form
  const [purchasesInputList, setPurchasesInputList] = useState([
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
          inputOptions: partsNameList,
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
  const [status, setStatus] = useState("Waiting for Shipping");
  const [buyType, setBuyType] = useState("Group Buy");
  const [vendor, setVendor] = useState("");
  const [tracking, setTracking] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(
    moment().format("yyyy-MM-DD")
  );
  const [customs, setCustoms] = useState(false);

  useEffect(() => {
    let tmpInputList = purchasesInputList;
    tmpInputList.forEach((input) => {
      input.partInput[1].inputOptions = partsNameList;
    });

    setPurchasesInputList(tmpInputList);
  }, [partsNameList, purchasesInputList]);

  const history = useNavigate();

  const showPurchasesForm = useCallback(() => {
    setFormPopupPurchases(true);
  }, []);

  const hidePurchasesForm = useCallback(() => {
    setFormPopupPurchases(false);
    if (formPopupPurchases) {
      setPurchasesInputList([
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
              inputOptions: partsNameList,
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
      setStatus("Waiting for Shipping");
      setBuyType("Group Buy");
      setVendor("");
      setTracking("");
      setPurchaseDate(moment().format("yyyy-MM-DD"));
      setCustoms(false);
    }
  }, [formPopupPurchases, partsNameList]);

  const showEditForm = useCallback(() => {
    setFormPopupEdit(true);
  }, []);

  const hideEditForm = useCallback(() => {
    setFormPopupEdit(false);
    if (formPopupEdit) {
      setPurchasesInputList([
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
              inputOptions: partsNameList,
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
      setStatus("Waiting for Shipping");
      setBuyType("Group Buy");
      setVendor("");
      setTracking("");
      setPurchaseDate(moment().format("yyyy-MM-DD"));
      setCustoms(false);
    }
  }, [formPopupEdit, partsNameList]);

  useEffect(() => {
    onValue(ref(db, "purchases/" + user?.uid + "/"), (snapshot) => {
      let list = [];
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        data["key"] = childSnapshot.key;
        list = [...list, data];
      });
      setPurchasesList(list);
    });
    onValue(ref(db, "parts/" + user?.uid + "/"), (snapshot) => {
      var partAssociation = partsList;
      let nameList = [""];
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        data["key"] = childSnapshot.key;
        partAssociation[data.Name] = data;
        nameList = [...nameList, data.Name];
      });
      setPartsList(partAssociation);
      setPartsNameList(nameList);
    });
    onValue(ref(db, "status/" + user?.uid), (snapshot) => {
      setStatusOptions(snapshot.val().Options);
    });
    onValue(ref(db, "buytype/" + user?.uid), (snapshot) => {
      setBuyTypeOptions(snapshot.val().Options);
    });
    onValue(ref(db, "userpreferences/" + user?.uid), (snapshot) => {
      setUserPreferences(snapshot.val());
    });
    return () => {
      off(ref(db, "purchases/" + user?.uid + "/"));
      off(ref(db, "parts/" + user?.uid + "/"));
      off(ref(db, "buytype/" + user?.uid));
      off(ref(db, "status/" + user?.uid));
    };
  }, [user, partsList, history]);

  const handlePurchasesEditClick = useCallback(
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
                inputOptions: partsNameList,
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

      setPurchasesInputList(list);
      setStatus(editData.Status);
      setBuyType(editData.BuyType);
      setVendor(editData.Vendor);
      setTracking(editData.Tracking);
      setPurchaseDate(editData.PurchaseDate);
      setCustoms(editData.Customs);

      showEditForm();
    },
    [showEditForm, partsNameList]
  );

  const handlePurchasesDeleteClick = useCallback(
    (editIndex, editKey) => {
      purchasesList[editIndex].Parts.forEach((x) => {
        update(ref(db, "parts/" + user?.uid + "/" + x.PartKey), {
          Quantity: userPreferences.onlyCountDelivered
            ? purchasesList[editIndex].Status === "Delivered"
              ? increment(-x.Quantity)
              : increment(0)
            : increment(-x.Quantity),
          purchasedPrice: userPreferences.onlyCountDelivered
            ? userPreferences.countAllForUnitPrice
              ? purchasesList[editIndex].Status === "Delivered"
                ? increment(-x.Price)
                : increment(0)
              : purchasesList[editIndex].Status === "Delivered" &&
                purchasesList[editIndex].BuyType !== "Giveaway" &&
                x.Price !== 0
              ? increment(-x.Price)
              : increment(0)
            : userPreferences.countAllForUnitPrice
            ? increment(-x.Price)
            : purchasesList[editIndex].BuyType !== "Giveaway" && x.Price !== 0
            ? increment(-x.Price)
            : increment(0),
          purchasedQuantity: userPreferences.onlyCountDelivered
            ? userPreferences.countAllForUnitPrice
              ? purchasesList[editIndex].Status === "Delivered"
                ? increment(-x.Quantity)
                : increment(0)
              : purchasesList[editIndex].Status === "Delivered" &&
                purchasesList[editIndex].BuyType !== "Giveaway" &&
                x.Price !== 0
              ? increment(-x.Quantity)
              : increment(0)
            : userPreferences.countAllForUnitPrice
            ? increment(-x.Quantity)
            : purchasesList[editIndex].BuyType !== "Giveaway" && x.Price !== 0
            ? increment(-x.Quantity)
            : increment(0),
        });
      });
      remove(ref(db, "purchases/" + user?.uid + "/" + editKey));
    },
    [user, purchasesList, userPreferences]
  );

  const handleAddClick = useCallback(() => {
    setPurchasesInputList([
      ...purchasesInputList,
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
            inputOptions: partsNameList,
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
  }, [partsNameList, purchasesInputList]);

  const handleRemoveClick = useCallback(
    (index) => {
      const list = [...purchasesInputList];
      list.splice(index, 1);
      setPurchasesInputList(list);
    },
    [purchasesInputList]
  );

  const handleInputChange = useCallback(
    (name, value, index) => {
      const list = [...purchasesInputList];
      list[index][name][0] = value;
      setPurchasesInputList(list);
    },
    [purchasesInputList]
  );

  const parsePurchaseFormIntoDb = useCallback(
    (
      vendor,
      tracking,
      status,
      buyType,
      purchaseDate,
      customs,
      purchasesInputList,
      edit
    ) => {
      if (edit) {
        hideEditForm();
        purchasesList[editIndex].Parts.forEach((x, i) => {
          update(ref(db, "parts/" + user?.uid + "/" + x.PartKey), {
            Quantity: userPreferences.onlyCountDelivered
              ? purchasesList[editIndex].Status === "Delivered"
                ? increment(-purchasesList[editIndex].Parts[i].Quantity)
                : increment(0)
              : increment(-purchasesList[editIndex].Parts[i].Quantity),
            purchasedPrice: userPreferences.onlyCountDelivered
              ? userPreferences.countAllForUnitPrice
                ? purchasesList[editIndex].Status === "Delivered"
                  ? increment(-purchasesList[editIndex].Parts[i].Price)
                  : increment(0)
                : purchasesList[editIndex].Status === "Delivered" &&
                  purchasesList[editIndex].BuyType !== "Giveaway" &&
                  purchasesList[editIndex].Parts[i].Price !== 0
                ? increment(-purchasesList[editIndex].Parts[i].Price)
                : increment(0)
              : userPreferences.countAllForUnitPrice
              ? increment(-purchasesList[editIndex].Parts[i].Price)
              : purchasesList[editIndex].BuyType !== "Giveaway" &&
                purchasesList[editIndex].Parts[i].Price !== 0
              ? increment(-purchasesList[editIndex].Parts[i].Price)
              : increment(0),
            purchasedQuantity: userPreferences.onlyCountDelivered
              ? userPreferences.countAllForUnitPrice
                ? purchasesList[editIndex].Status === "Delivered"
                  ? increment(-purchasesList[editIndex].Parts[i].Quantity)
                  : increment(0)
                : purchasesList[editIndex].Status === "Delivered" &&
                  purchasesList[editIndex].BuyType !== "Giveaway" &&
                  purchasesList[editIndex].Parts[i].Price !== 0
                ? increment(-purchasesList[editIndex].Parts[i].Quantity)
                : increment(0)
              : userPreferences.countAllForUnitPrice
              ? increment(-purchasesList[editIndex].Parts[i].Quantity)
              : purchasesList[editIndex].BuyType !== "Giveaway" &&
                purchasesList[editIndex].Parts[i].Price !== 0
              ? increment(-purchasesList[editIndex].Parts[i].Quantity)
              : increment(0),
          });
        });
        remove(ref(db, "purchases/" + user?.uid + "/" + editKey));
      } else hidePurchasesForm();

      const data = {
        Vendor: vendor,
        Tracking: tracking,
        Status: status,
        BuyType: buyType,
        PurchaseDate: moment(purchaseDate).format("yyyy-MM-DD"),
        Customs: customs,
        Parts: purchasesInputList.map((x) => {
          let partKey;

          if (!partsNameList.includes(x.partInput[0])) {
            partKey = push(child(ref(db), "parts/" + user?.uid + "/")).key;
            set(ref(db, "parts/" + user?.uid + "/" + partKey), {
              Name: x.partInput[0],
              Quantity: userPreferences.onlyCountDelivered
                ? status === "Delivered"
                  ? parseInt(x.quantityInput[0])
                  : 0
                : parseInt(x.quantityInput[0]),
              Type: "",
              SubType: "",
              purchasedPrice: userPreferences.onlyCountDelivered
                ? userPreferences.countAllForUnitPrice
                  ? status === "Delivered"
                    ? parseFloat(x.priceInput[0])
                    : 0
                  : status === "Delivered" &&
                    buyType !== "Giveaway" &&
                    parseFloat(x.priceInput[0]) !== 0
                  ? parseInt(x.priceInput[0])
                  : 0
                : userPreferences.countAllForUnitPrice
                ? parseInt(x.priceInput[0])
                : buyType !== "Giveaway" && parseFloat(x.priceInput[0]) !== 0
                ? parseInt(x.priceInput[0])
                : 0,
              purchasedQuantity: userPreferences.onlyCountDelivered
                ? userPreferences.countAllForUnitPrice
                  ? status === "Delivered"
                    ? parseInt(x.quantityInput[0])
                    : 0
                  : status === "Delivered" &&
                    buyType !== "Giveaway" &&
                    parseFloat(x.priceInput[0]) !== 0
                  ? parseInt(x.quantityInput[0])
                  : 0
                : userPreferences.countAllForUnitPrice
                ? parseInt(x.quantityInput[0])
                : buyType !== "Giveaway" && parseFloat(x.priceInput[0]) !== 0
                ? parseInt(x.quantityInput[0])
                : 0,
              Notes: "",
              soldPrice: 0.0,
              soldQuantity: 0,
            });
          } else {
            partKey = partsList[x.partInput[0]].key;
            update(ref(db, "parts/" + user?.uid + "/" + partKey), {
              Quantity: userPreferences.onlyCountDelivered
                ? status === "Delivered"
                  ? increment(parseInt(x.quantityInput[0]))
                  : increment(0)
                : increment(parseInt(x.quantityInput[0])),
              purchasedPrice: userPreferences.onlyCountDelivered
                ? userPreferences.countAllForUnitPrice
                  ? status === "Delivered"
                    ? increment(parseFloat(x.priceInput[0]))
                    : increment(0)
                  : status === "Delivered" &&
                    buyType !== "Giveaway" &&
                    parseFloat(x.priceInput[0]) !== 0
                  ? increment(parseFloat(x.priceInput[0]))
                  : increment(0)
                : userPreferences.countAllForUnitPrice
                ? increment(parseFloat(x.priceInput[0]))
                : buyType !== "Giveaway" && parseFloat(x.priceInput[0]) !== 0
                ? increment(parseFloat(x.priceInput[0]))
                : increment(0),
              purchasedQuantity: userPreferences.onlyCountDelivered
                ? userPreferences.countAllForUnitPrice
                  ? status === "Delivered"
                    ? increment(parseInt(x.quantityInput[0]))
                    : increment(0)
                  : status === "Delivered" &&
                    buyType !== "Giveaway" &&
                    parseFloat(x.priceInput[0]) !== 0
                  ? increment(parseInt(x.quantityInput[0]))
                  : increment(0)
                : userPreferences.countAllForUnitPrice
                ? increment(parseInt(x.quantityInput[0]))
                : buyType !== "Giveaway" && parseFloat(x.priceInput[0]) !== 0
                ? increment(parseInt(x.quantityInput[0]))
                : increment(0),
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

      const newPurchaseKey = push(
        child(ref(db), "purchases/" + user?.uid + "/")
      ).key;
      set(ref(db, "purchases/" + user?.uid + "/" + newPurchaseKey), data);
    },
    [
      user,
      userPreferences,
      partsList,
      partsNameList,
      purchasesList,
      editIndex,
      editKey,
      hideEditForm,
      hidePurchasesForm,
    ]
  );

  const [purchasesHeadcells] = useState([
    {
      id: "Vendor",
      disablePadding: true,
      orderable: true,
      label: "Vendor",
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
      id: "Status",
      disablePadding: false,
      orderable: true,
      label: "Status",
    },
    {
      id: "BuyType",
      disablePadding: false,
      orderable: true,
      label: "Buy Type",
    },
    {
      id: "Customs",
      disablePadding: false,
      orderable: true,
      label: "Customs",
    },
    {
      id: "Tracking",
      disablePadding: false,
      orderable: true,
      label: "Tracking",
    },
    {
      id: "PurchaseDate",
      disablePadding: false,
      orderable: true,
      label: "Purchase Date",
    },
  ]);

  const [keyOrderPurchases] = useState([
    ["Vendor", "string"],
    ["Parts", "nested"],
    ["Status", "string"],
    ["BuyType", "string"],
    ["Customs", "boolean"],
    ["Tracking", "string"],
    ["PurchaseDate", "string"],
  ]);
  const [searchOptionsPurchases] = useState(["Vendor", "Parts", "Tracking"]);
  const [filterOptionsPurchases, setFilterOptionsPurchases] = useState({
    PurchaseDate: ["date", []],
    Status: ["select", []],
    BuyType: ["select", []],
    Customs: ["boolean"],
  });

  useEffect(() => {
    setFilterOptionsPurchases({
      PurchaseDate: ["date", []],
      Status: ["select", statusOptions],
      BuyType: ["select", buyTypeOptions],
      Customs: ["boolean"],
    });
  }, [statusOptions, buyTypeOptions]);

  const [inputFieldsPurchases, setInputFieldsPurchases] = useState([
    {
      inputType: "textfield",
      inputTitle: "Vendor",
      gridSize: 4,
      inputSetStateFn: setVendor,
      currentValue: vendor,
      isRequired: true,
    },
    {
      inputType: "textfield",
      inputTitle: "Tracking",
      gridSize: 4,
      inputSetStateFn: setTracking,
      currentValue: tracking,
      isRequired: false,
    },
    {
      inputType: "checkbox",
      inputTitle: "Customs",
      gridSize: 4,
      inputSetStateFn: setCustoms,
      currentValue: customs,
      isRequired: false,
    },
    {
      inputType: "select",
      inputTitle: "Status",
      gridSize: 4,
      inputSetStateFn: setStatus,
      inputOptions: statusOptions,
      currentValue: status,
      isRequired: true,
    },
    {
      inputType: "select",
      inputTitle: "Buy Type",
      gridSize: 4,
      inputSetStateFn: setBuyType,
      inputOptions: buyTypeOptions,
      currentValue: buyType,
      isRequired: true,
    },
    {
      inputType: "date",
      inputTitle: "Purchase Date",
      gridSize: 4,
      inputSetStateFn: setPurchaseDate,
      currentValue: purchaseDate,
      isRequired: true,
    },
    {
      inputType: "dynamic",
      inputTitle: "PartArray",
      currentValue: purchasesInputList,
      inputSetStateFn: handleInputChange,
      gridSize: 12,
      isRequired: true,
    },
  ]);

  useEffect(() => {
    setInputFieldsPurchases([
      {
        inputType: "textfield",
        inputTitle: "Vendor",
        gridSize: 4,
        inputSetStateFn: setVendor,
        currentValue: vendor,
        isRequired: true,
      },
      {
        inputType: "textfield",
        inputTitle: "Tracking",
        gridSize: 4,
        inputSetStateFn: setTracking,
        currentValue: tracking,
        isRequired: false,
      },
      {
        inputType: "checkbox",
        inputTitle: "Customs",
        gridSize: 4,
        inputSetStateFn: setCustoms,
        currentValue: customs,
        isRequired: false,
      },
      {
        inputType: "select",
        inputTitle: "Status",
        gridSize: 4,
        inputSetStateFn: setStatus,
        inputOptions: statusOptions,
        currentValue: status,
        isRequired: true,
      },
      {
        inputType: "select",
        inputTitle: "Buy Type",
        gridSize: 4,
        inputSetStateFn: setBuyType,
        inputOptions: buyTypeOptions,
        currentValue: buyType,
        isRequired: true,
      },
      {
        inputType: "date",
        inputTitle: "Purchase Date",
        gridSize: 4,
        inputSetStateFn: setPurchaseDate,
        currentValue: purchaseDate,
        isRequired: true,
      },
      {
        inputType: "dynamic",
        inputTitle: "PartArray",
        currentValue: purchasesInputList,
        inputSetStateFn: handleInputChange,
        gridSize: 12,
        isRequired: true,
      },
    ]);
  }, [
    vendor,
    tracking,
    customs,
    statusOptions,
    status,
    buyType,
    buyTypeOptions,
    purchaseDate,
    purchasesInputList,
    handleInputChange,
  ]);

  return (
    <Grid
      container
      spacing={2}
      justifyContent='center'
      alignItems='center'
      sx={{ pl: 5, pr: 5, height: "100%" }}
    >
      <Grid item xs={12} id='purchasesTable' sx={{ height: "100%" }}>
        <Card elevation={5} sx={{ height: "100%" }}>
          {purchasesList.length !== 0 ? (
            <CardHeader
              title='Purchases'
              action={
                <Button variant='contained' onClick={showPurchasesForm}>
                  <AddIcon />
                </Button>
              }
            />
          ) : (
            <CardHeader title='Purchases' />
          )}
          <CardContent>
            {purchasesList.length !== 0 ? (
              <EnhancedTable
                defaultOrderBy=''
                tableData={purchasesList}
                tableHeadcells={purchasesHeadcells}
                editFunction={handlePurchasesEditClick}
                deleteFunction={handlePurchasesDeleteClick}
                keyOrder={keyOrderPurchases}
                isEditable={true}
                isDeletable={true}
                searchOptions={searchOptionsPurchases}
                filterOptions={filterOptionsPurchases}
              />
            ) : (
              <Grid
                container
                spacing={2}
                direction='column'
                justifyContent='center'
                alignItems='center'
                sx={{
                  height: "60vh",
                  width: "100%",
                }}
              >
                <Grid item>
                  <Typography variant='h5'>
                    You have no Purchases currently...
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant='h6'>
                    Click the button to add your first!
                  </Typography>
                </Grid>
                <Grid item>
                  <Button variant='contained' onClick={showPurchasesForm}>
                    <AddIcon />
                  </Button>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>
      </Grid>

      {formPopupPurchases && (
        <Form
          openBool={formPopupPurchases}
          onCloseFn={hidePurchasesForm}
          onSubmitFn={(editBool) => {
            parsePurchaseFormIntoDb(
              vendor,
              tracking,
              status,
              buyType,
              purchaseDate,
              customs,
              purchasesInputList,
              editBool
            );
          }}
          inputFields={inputFieldsPurchases}
          formTitle='Purchases'
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
            parsePurchaseFormIntoDb(
              vendor,
              tracking,
              status,
              buyType,
              purchaseDate,
              customs,
              purchasesInputList,
              editBool
            );
          }}
          inputFields={inputFieldsPurchases}
          formTitle='Purchases'
          editBool={true}
          userPreferences={userPreferences}
          dynamicAdd={handleAddClick}
          dynamicRemove={handleRemoveClick}
        />
      )}
    </Grid>
  );
}

export default Purchases;
