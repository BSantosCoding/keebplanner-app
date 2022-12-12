import React, { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  ref,
  onValue,
  off,
  update,
  push,
  child,
  increment,
  remove,
} from "@firebase/database";
import { db } from "./../../Firebase/firebase";
import { AuthContext } from "./../../context/Context";
import { Card, CardContent, CardHeader, Grid } from "@mui/material";
import EnhancedTable from "./../Table/Table";
import Form from "../Form/Form";

function Parts() {
  const { user } = useContext(AuthContext);
  const [formPopupEdit, setFormPopupEdit] = useState(false);
  const [formPopupMod, setFormPopupMod] = useState(false);

  //Parts Form
  const [type, setType] = useState("");
  const [subType, setSubType] = useState("");
  const [notes, setNotes] = useState("");

  //Retrive list of existing Parts
  const [partsList, setPartsList] = useState({});
  const [partsArray, setPartsArray] = useState([]);
  const [filteredPartsList, setFilteredPartsList] = useState([]); //Parts with positive quantity
  const [filmsPartsList, setFilmsPartsList] = useState([]);
  const [springsPartsList, setSpringsPartsList] = useState([]);
  const [lubesPartsList, setLubesPartsList] = useState([]);

  //Edit Form
  const [editKey, setEditKey] = useState("");
  const [editIndex, setEditIndex] = useState(0);

  //Mod Form
  const [modKey, setModKey] = useState("");
  const [modIndex, setModIndex] = useState(0);
  const [springs, setSprings] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [lubes, setLubes] = useState("");
  const [films, setFilms] = useState("");
  const [switches, setSwitches] = useState("");

  const history = useNavigate();

  //Types and SubTypes
  const [tagsOptions, setTagsOptions] = useState({});

  //User preferences
  const [userPreferences, setUserPreferences] = useState({
    onlyCountDelivered: false,
    requireInventory: false,
    showAllParts: true,
    countAllForUnitPrice: true,
  });

  const [subTags, setSubTags] = useState([]);
  useEffect(() => {
    var subTags = [];
    Object.entries(tagsOptions).forEach(([key, value]) => {
      subTags.push(...value);
    });

    setSubTags([...new Set(subTags)]);
  }, [tagsOptions]);

  useEffect(() => {
    onValue(ref(db, "parts/" + user?.uid + "/"), (snapshot) => {
      var partAssociation = partsList;
      var tempPartsList = [];
      var filteredList = [];
      var filmsList = [];
      var springsList = [];
      var lubesList = [];
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        data["key"] = childSnapshot.key;
        let parsedData = {
          key: data.key,
          Name: data.Name,
          Quantity: data.Quantity,
          UnitPrice:
            data.purchasedQuantity === 0
              ? 0
              : parseFloat(
                  data.purchasedPrice / data.purchasedQuantity
                ).toFixed(2),
          Type: data.Type,
          SubType: data.SubType,
          Notes: data.Notes,
          filmsKey: data.filmsKey ? data.filmsKey : null,
          springsKey: data.springsKey ? data.springsKey : null,
          switchesKey: data.switchesKey ? data.switchesKey : null,
        };
        partAssociation[data.Name] = parsedData;
        tempPartsList = [...tempPartsList, parsedData];
        if (parseInt(data.Quantity) > 0) {
          filteredList = [...filteredList, parsedData];
        }
        if (data.Type.toLowerCase() === "films" && data.Quantity > 0) {
          filmsList = [...filmsList, parsedData.Name];
        }
        if (data.Type.toLowerCase() === "lube" && data.Quantity > 0) {
          lubesList = [...lubesList, parsedData.Name];
        }
        if (data.Type.toLowerCase() === "springs" && data.Quantity > 0) {
          springsList = [...springsList, parsedData.Name];
        }
      });
      setPartsArray(tempPartsList);
      setPartsList(partAssociation);
      setFilteredPartsList(filteredList);
      setFilmsPartsList(filmsList);
      setSpringsPartsList(springsList);
      setLubesPartsList(lubesList);
    });
    onValue(ref(db, "tags/" + user?.uid), (snapshot) => {
      setTagsOptions({
        "": [""],
        ...snapshot.val(),
      });
    });
    onValue(ref(db, "userpreferences/" + user?.uid), (snapshot) => {
      setUserPreferences(snapshot.val());
    });
    return () => {
      off(ref(db, "userpreferences/" + user?.uid));
      off(ref(db, "parts/" + user?.uid + "/"));
      off(ref(db, "tags/" + user?.uid));
    };
  }, [user, partsList, history]);

  const showEditForm = useCallback(() => {
    setFormPopupEdit(true);
  }, []);

  const hideEditForm = useCallback(() => {
    setFormPopupEdit(false);
    if (formPopupEdit) {
      setType("");
      setSubType("");
      setNotes("");
    }
  }, [formPopupEdit]);

  const handlePartsEditClick = useCallback(
    (editData, editIndex) => {
      setEditKey(editData.key);
      setEditIndex(editIndex);

      setNotes(editData.Notes);
      setType(editData.Type);
      setSubType(editData.SubType);

      showEditForm();
    },
    [showEditForm]
  );

  const parsePartFormIntoDb = useCallback(
    (type, subType, notes) => {
      update(ref(db, "parts/" + user?.uid + "/" + editKey), {
        Type: type,
        SubType: subType,
        Notes: notes,
      });
      hideEditForm();
    },
    [user, editKey, hideEditForm]
  );

  const showModForm = useCallback(() => {
    setFormPopupMod(true);
  }, []);

  const hideModForm = useCallback(() => {
    setFormPopupMod(false);
    if (formPopupMod) {
      setQuantity("");
      setFilms("");
      setSprings("");
      setLubes("");
    }
  }, [formPopupMod]);

  const handlePartsModClick = useCallback(
    (modData, modIndex) => {
      setModKey(modData.key);
      setModIndex(modIndex);

      setSwitches(modData.Name);

      showModForm();
    },
    [showModForm]
  );

  const parseModFormIntoDb = useCallback(
    (quantity, films, springs, lubes) => {
      let filmsTotalPrice = 0,
        springsTotalPrice = 0,
        switchesTotalPrice = 0;
      if (films) filmsTotalPrice = partsList[films].UnitPrice * quantity;
      if (springs) springsTotalPrice = partsList[springs].UnitPrice * quantity;
      switchesTotalPrice = partsList[switches].UnitPrice * quantity;

      let partKey = push(child(ref(db), "parts/" + user?.uid + "/")).key;
      update(ref(db, "parts/" + user?.uid + "/" + partKey), {
        Name: "[MODDED] " + switches,
        Quantity: quantity,
        Type: "Modded",
        SubType: "",
        Notes: [films, springs, lubes]
          .filter((v) => {
            return v != "";
          })
          .join(", "),
        purchasedPrice:
          filmsTotalPrice + springsTotalPrice + switchesTotalPrice,
        purchasedQuantity: quantity,
        soldPrice: 0,
        soldQuantity: 0,
        switchesKey: partsList[switches].key,
        filmsKey: partsList[films].key,
        springsKey: partsList[springs].key,
      });
      update(ref(db, "parts/" + user?.uid + "/" + modKey), {
        Quantity: increment(-quantity),
      });
      films &&
        update(ref(db, "parts/" + user?.uid + "/" + partsList[films].key), {
          Quantity: increment(-quantity),
        });
      springs &&
        update(ref(db, "parts/" + user?.uid + "/" + partsList[springs].key), {
          Quantity: increment(-quantity),
        });
      hideModForm();
    },
    [user, modKey, partsList, switches, hideModForm]
  );

  const handlePartsDeleteClick = useCallback(
    (editIndex, editKey) => {
      update(
        ref(db, "parts/" + user?.uid + "/" + partsArray[editIndex].filmsKey),
        {
          Quantity: increment(parseInt(partsArray[editIndex].Quantity)),
        }
      );
      update(
        ref(db, "parts/" + user?.uid + "/" + partsArray[editIndex].springsKey),
        {
          Quantity: increment(parseInt(partsArray[editIndex].Quantity)),
        }
      );
      update(
        ref(db, "parts/" + user?.uid + "/" + partsArray[editIndex].switchesKey),
        {
          Quantity: increment(parseInt(partsArray[editIndex].Quantity)),
        }
      );
      remove(ref(db, "parts/" + user?.uid + "/" + editKey));
    },
    [user, partsArray]
  );

  const [partsHeadcells] = useState([
    {
      id: "Name",
      disablePadding: true,
      label: "Product Name",
    },
    {
      id: "Quantity",
      disablePadding: false,
      label: "Quantity",
    },
    {
      id: "UnitPrice",
      disablePadding: false,
      label: "Unit Price",
    },
    {
      id: "Type",
      disablePadding: false,
      label: "Type",
    },
    {
      id: "SubType",
      disablePadding: false,
      label: "Sub Type",
    },
    {
      id: "Notes",
      disablePadding: false,
      label: "Notes",
    },
  ]);

  function getMax(arr, prop) {
    var max = 0;
    for (var i = 0; i < arr.length; i++) {
      if (max === 0 || arr[i][prop] > max) {
        max = arr[i][prop];
      }
    }
    return max;
  }

  const [keyOrderParts] = useState([
    ["Name", "string"],
    ["Quantity", "string"],
    ["UnitPrice", "string"],
    ["Type", "string"],
    ["SubType", "string"],
    ["Notes", "string"],
  ]);
  const [searchOptionsParts] = useState(["Name"]);

  const [filterOptionsParts, setFilterOptionsParts] = useState({
    Quantity: ["range", []],
    UnitPrice: ["range", []],
    Type: ["select", []],
    SubType: ["select", []],
  });

  useEffect(() => {
    setFilterOptionsParts({
      Quantity: ["range", [0, parseInt(getMax(partsArray, "Quantity"))]],
      UnitPrice: ["range", [0, parseFloat(getMax(partsArray, "UnitPrice"))]],
      Type: ["select", [...Object.keys(tagsOptions)]],
      SubType: ["select", subTags],
    });
  }, [tagsOptions, partsArray, subTags]);

  const [inputFieldsParts, setInputFieldsParts] = useState([
    {
      inputType: "autocomplete",
      inputTitle: "Type",
      gridSize: 6,
      inputSetStateFn: (e, newValue) => {
        setType(newValue);
        setSubType("");
      },
      inputOptions: Object.keys(tagsOptions),
      currentValue: type,
      isRequired: true,
    },
    {
      inputType: "autocomplete",
      inputTitle: "Sub Type",
      gridSize: 6,
      inputSetStateFn: (e, newValue) => {
        setSubType(newValue);
      },
      inputOptions: tagsOptions[type] === undefined ? [""] : tagsOptions[type],
      currentValue: subType,
      isRequired: false,
    },
    {
      inputType: "textfield",
      inputTitle: "Notes",
      gridSize: 12,
      inputSetStateFn: setNotes,
      currentValue: notes,
      isRequired: false,
    },
  ]);

  useEffect(() => {
    setInputFieldsParts([
      {
        inputType: "autocomplete",
        inputTitle: "Type",
        gridSize: 6,
        inputSetStateFn: (e, newValue) => {
          setType(newValue);
          setSubType("");
        },
        inputOptions: Object.keys(tagsOptions),
        currentValue: type,
        isRequired: true,
      },
      {
        inputType: "autocomplete",
        inputTitle: "Sub Type",
        gridSize: 6,
        inputSetStateFn: (e, newValue) => {
          setSubType(newValue);
        },
        inputOptions:
          tagsOptions[type] === undefined ? [""] : tagsOptions[type],
        currentValue: subType,
        isRequired: false,
      },
      {
        inputType: "textfield",
        inputTitle: "Notes",
        gridSize: 12,
        inputSetStateFn: setNotes,
        currentValue: notes,
        isRequired: false,
      },
    ]);
  }, [type, tagsOptions, subType, notes]);

  const [inputFieldsMods, setInputFieldsMods] = useState([
    {
      inputType: "number",
      inputTitle: "Quantity",
      gridSize: 12,
      inputSetStateFn: (newValue) => {
        setQuantity(newValue);
      },
      currentValue: quantity,
      isRequired: true,
    },
    {
      inputType: "autocomplete",
      inputTitle: "Films",
      gridSize: 4,
      inputSetStateFn: (e, newValue) => {
        setFilms(newValue);
      },
      inputOptions: filmsPartsList,
      currentValue: films,
      isRequired: false,
    },
    {
      inputType: "autocomplete",
      inputTitle: "Springs",
      gridSize: 4,
      inputSetStateFn: (e, newValue) => {
        setFilms(newValue);
      },
      inputOptions: springsPartsList,
      currentValue: springs,
      isRequired: false,
    },
    {
      inputType: "autocomplete",
      inputTitle: "Lube",
      gridSize: 4,
      inputSetStateFn: (e, newValue) => {
        setLubes(newValue);
      },
      inputOptions: lubesPartsList,
      currentValue: lubes,
      isRequired: false,
    },
  ]);

  useEffect(() => {
    setInputFieldsMods([
      {
        inputType: "number",
        inputTitle: "Quantity",
        gridSize: 12,
        inputSetStateFn: (newValue) => {
          setQuantity(newValue);
        },
        currentValue: quantity,
        isRequired: true,
      },
      {
        inputType: "autocomplete",
        inputTitle: "Films",
        gridSize: 4,
        inputSetStateFn: (e, newValue) => {
          setFilms(newValue);
        },
        inputOptions: filmsPartsList,
        currentValue: films,
        isRequired: false,
      },
      {
        inputType: "autocomplete",
        inputTitle: "Springs",
        gridSize: 4,
        inputSetStateFn: (e, newValue) => {
          setSprings(newValue);
        },
        inputOptions: springsPartsList,
        currentValue: springs,
        isRequired: false,
      },
      {
        inputType: "autocomplete",
        inputTitle: "Lube",
        gridSize: 4,
        inputSetStateFn: (e, newValue) => {
          setLubes(newValue);
        },
        inputOptions: lubesPartsList,
        currentValue: lubes,
        isRequired: false,
      },
    ]);
  }, [
    lubes,
    lubesPartsList,
    springs,
    springsPartsList,
    films,
    filmsPartsList,
    quantity,
  ]);

  return (
    <Grid
      container
      spacing={2}
      justifyContent='center'
      alignItems='center'
      sx={{ pl: 5, pr: 5, height: "100%" }}
    >
      <Grid item xs={12} id='partsTable' sx={{ height: "100%" }}>
        <Card elevation={5} sx={{ height: "100%" }}>
          <CardHeader title='Parts' />
          <CardContent>
            {userPreferences.showAllParts
              ? partsArray.length !== 0 && (
                  <EnhancedTable
                    defaultOrderBy=''
                    tableData={partsArray}
                    tableHeadcells={partsHeadcells}
                    editFunction={handlePartsEditClick}
                    modFunction={handlePartsModClick}
                    deleteFunction={handlePartsDeleteClick}
                    keyOrder={keyOrderParts}
                    isEditable={false}
                    isDeletable={false}
                    searchOptions={searchOptionsParts}
                    filterOptions={filterOptionsParts}
                    tableName='Parts'
                  />
                )
              : filteredPartsList.length !== 0 && (
                  <EnhancedTable
                    defaultOrderBy=''
                    tableData={filteredPartsList}
                    tableHeadcells={partsHeadcells}
                    editFunction={handlePartsEditClick}
                    modFunction={handlePartsModClick}
                    deleteFunction={handlePartsDeleteClick}
                    keyOrder={keyOrderParts}
                    isEditable={false}
                    isDeletable={false}
                    searchOptions={searchOptionsParts}
                    filterOptions={filterOptionsParts}
                    tableName='Parts'
                  />
                )}
          </CardContent>
        </Card>
      </Grid>

      {formPopupEdit && (
        <Form
          openBool={formPopupEdit}
          onCloseFn={hideEditForm}
          onSubmitFn={(editBool) => {
            parsePartFormIntoDb(type, subType, notes);
          }}
          inputFields={inputFieldsParts}
          formTitle='Parts'
          editBool={true}
          userPreferences={null}
          dynamicAdd={() => {}}
          dynamicRemove={() => {}}
        />
      )}

      {formPopupMod && (
        <Form
          openBool={formPopupMod}
          onCloseFn={hideModForm}
          onSubmitFn={(modBool) => {
            parseModFormIntoDb(quantity, films, springs, lubes);
          }}
          inputFields={inputFieldsMods}
          formTitle='Mod'
          editBool={false}
          userPreferences={null}
          dynamicAdd={() => {}}
          dynamicRemove={() => {}}
        />
      )}
    </Grid>
  );
}

export default Parts;
