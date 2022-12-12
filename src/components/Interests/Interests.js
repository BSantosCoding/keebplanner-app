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
} from "@firebase/database";
import { db } from "./../../Firebase/firebase";
import { AuthContext } from "./../../context/Context";
import {
  Card,
  CardHeader,
  Button,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import EnhancedTable from "./../Table/Table";
import moment from "moment";
import AddIcon from "@mui/icons-material/Add";
import Form from "./../Form/Form";

function Interests() {
  const { user } = useContext(AuthContext);
  const [formPopupInterests, setFormPopupInterests] = useState(false);
  const [formPopupEdit, setFormPopupEdit] = useState(false);

  const [editKey, setEditKey] = useState("");
  const [editIndex, setEditIndex] = useState(0);

  //Interests form data
  const [proxy, setProxy] = useState("");
  const [product, setProduct] = useState("");
  const [link, setLink] = useState("");
  const [dateInterval, setDateInterval] = useState([null, null]);
  const [interest, setInterest] = useState("");
  const [buyType, setBuyType] = useState("");
  const [type, setType] = useState("");
  const [subType, setSubType] = useState("");

  //Retrieve interests data
  const [interestsList, setInterestsList] = useState([]);

  //Get user options
  const [tagsOptions, setTagsOptions] = useState({});
  const [buyTypeOptions, setBuyTypeOptions] = useState([]);
  const [interestOptions, setInterestOptions] = useState([]);

  const [subTags, setSubTags] = useState([]);
  useEffect(() => {
    var subTags = [];
    Object.entries(tagsOptions).forEach(([key, value]) => {
      subTags.push(...value);
    });

    setSubTags([...new Set(subTags)]);
  }, [tagsOptions]);

  const history = useNavigate();

  const showInterestsForm = useCallback(() => {
    setFormPopupInterests(true);
  }, []);

  const hideInterestsForm = useCallback(() => {
    setFormPopupInterests(false);
    if (formPopupInterests) {
      setProxy("");
      setProduct("");
      setLink("");
      setDateInterval([null, null]);
      setInterest("");
      setBuyType("");
      setType("");
      setSubType("");
    }
  }, [formPopupInterests]);

  const showEditForm = useCallback(() => {
    setFormPopupEdit(true);
  }, []);

  const hideEditForm = useCallback(() => {
    setFormPopupEdit(false);
    if (formPopupEdit) {
      setProxy("");
      setProduct("");
      setLink("");
      setDateInterval([null, null]);
      setInterest("");
      setBuyType("");
      setType("");
      setSubType("");
    }
  }, [formPopupEdit]);

  useEffect(() => {
    onValue(ref(db, "interests/" + user?.uid + "/"), (snapshot) => {
      let list = [];
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        data["key"] = childSnapshot.key;
        list = [...list, data];
      });
      setInterestsList(list);
    });
    onValue(ref(db, "tags/" + user?.uid), (snapshot) => {
      setTagsOptions({
        "": [""],
        ...snapshot.val(),
      });
    });
    onValue(ref(db, "buytype/" + user?.uid), (snapshot) => {
      setBuyTypeOptions(snapshot.val().Options);
    });
    onValue(ref(db, "interest/" + user?.uid), (snapshot) => {
      setInterestOptions(snapshot.val().Options);
    });
    return () => {
      off(ref(db, "interests/" + user?.uid + "/"));
      off(ref(db, "interest/" + user?.uid));
      off(ref(db, "buytype/" + user?.uid));
      off(ref(db, "tags/" + user?.uid));
    };
  }, [user, history]);

  const handleInterestsEditClick = useCallback(
    (editData, editIndex) => {
      setEditKey(editData.key);
      setEditIndex(editIndex);

      setProxy(editData.Proxy);
      setProduct(editData.Product);
      setLink(editData.Link);
      setDateInterval([editData.StartDate, editData.EndDate]);
      setInterest(editData.Interest);
      setBuyType(editData.BuyType);
      setType(editData.Type);
      setSubType(editData.SubType);

      showEditForm();
    },
    [showEditForm]
  );

  const handleInterestsDeleteClick = useCallback(
    (editIndex, editKey) => {
      remove(ref(db, "interests/" + user?.uid + "/" + editKey));
    },
    [user]
  );

  const parseInterestFormIntoDb = useCallback(
    (
      product,
      proxy,
      link,
      dateInterval,
      interest,
      buyType,
      type,
      subType,
      edit
    ) => {
      if (edit) {
        remove(ref(db, "interests/" + user?.uid + "/" + editKey));
        hideEditForm();
      } else hideInterestsForm();

      const data = {
        Proxy: proxy,
        Product: product,
        Link: link,
        StartDate: moment(dateInterval[0]).format("yyyy-MM-DD"),
        EndDate: moment(dateInterval[1]).format("yyyy-MM-DD"),
        Interest: interest,
        BuyType: buyType,
        Type: type,
        SubType: subType,
      };

      const newSaleKey = push(child(ref(db), "sales/" + user?.uid + "/")).key;
      set(ref(db, "interests/" + user?.uid + "/" + newSaleKey), data);
    },
    [user, editKey, hideEditForm, hideInterestsForm]
  );

  const [interestsHeadcells] = useState([
    {
      id: "Proxy",
      disablePadding: true,
      orderable: true,
      label: "Proxy",
    },
    {
      id: "Product",
      disablePadding: true,
      orderable: true,
      label: "Product",
    },
    {
      id: "Link",
      disablePadding: false,
      orderable: true,
      label: "Link",
    },
    {
      id: "StartDate",
      disablePadding: false,
      orderable: true,
      label: "Start Date",
    },
    {
      id: "EndDate",
      disablePadding: false,
      orderable: true,
      label: "End Date",
    },
    {
      id: "Interest",
      disablePadding: false,
      orderable: true,
      label: "Interest",
    },
    {
      id: "BuyType",
      disablePadding: false,
      orderable: true,
      label: "Buy Type",
    },
    {
      id: "Type",
      disablePadding: false,
      orderable: true,
      label: "Type",
    },
    {
      id: "SubType",
      disablePadding: false,
      orderable: true,
      label: "Sub Type",
    },
  ]);

  const [searchOptions] = useState(["Proxy", "Link", "Product"]);
  const [keyOrder] = useState([
    ["Proxy", "string"],
    ["Product", "string"],
    ["Link", "link"],
    ["StartDate", "string"],
    ["EndDate", "string"],
    ["Interest", "string"],
    ["BuyType", "string"],
    ["Type", "string"],
    ["SubType", "string"],
  ]);
  const [filterOptions, setFilterOptions] = useState({
    StartDate: ["date", []],
    EndDate: ["date", []],
    Type: ["select", []],
    SubType: ["select", []],
    BuyType: ["select", []],
    Interest: ["select", []],
  });

  useEffect(() => {
    setFilterOptions({
      StartDate: ["date", []],
      EndDate: ["date", []],
      Type: ["select", [...Object.keys(tagsOptions)]],
      SubType: ["select", subTags],
      BuyType: ["select", buyTypeOptions],
      Interest: ["select", interestOptions],
    });
  }, [tagsOptions, subTags, buyTypeOptions, interestOptions]);

  const [inputFields, setInputFields] = useState([
    {
      inputType: "textfield",
      inputTitle: "Proxy",
      gridSize: 4,
      inputSetStateFn: setProxy,
      currentValue: proxy,
      isRequired: false,
    },
    {
      inputType: "textfield",
      inputTitle: "Product",
      gridSize: 4,
      inputSetStateFn: setProduct,
      currentValue: product,
      isRequired: true,
    },
    {
      inputType: "textfield",
      inputTitle: "Link",
      gridSize: 4,
      inputSetStateFn: setLink,
      currentValue: link,
      isRequired: false,
    },
    {
      inputType: "select",
      inputTitle: "Interest",
      gridSize: 4,
      inputSetStateFn: setInterest,
      inputOptions: interestOptions,
      currentValue: interest,
      isRequired: true,
    },
    {
      inputType: "daterange",
      inputTitle: ["Start Date", "End Date"],
      gridSize: 8,
      inputSetStateFn: setDateInterval,
      currentValue: dateInterval,
      isRequired: false,
    },
    {
      inputType: "autocomplete",
      inputTitle: "Type",
      gridSize: 4,
      inputSetStateFn: (e, newValue) => {
        setType(newValue);
        setSubType("");
      },
      inputOptions: Object.keys(tagsOptions),
      currentValue: type,
      isRequired: false,
    },
    {
      inputType: "autocomplete",
      inputTitle: "Sub Type",
      gridSize: 4,
      inputSetStateFn: (e, newValue) => {
        setSubType(newValue);
      },
      inputOptions: tagsOptions[type] === undefined ? [""] : tagsOptions[type],
      currentValue: subType,
      isRequired: false,
    },
    {
      inputType: "select",
      inputTitle: "Buy Type",
      gridSize: 4,
      inputSetStateFn: setBuyType,
      inputOptions: buyTypeOptions,
      currentValue: buyType,
      isRequired: false,
    },
  ]);

  useEffect(() => {
    setInputFields([
      {
        inputType: "textfield",
        inputTitle: "Proxy",
        gridSize: 4,
        inputSetStateFn: setProxy,
        currentValue: proxy,
        isRequired: false,
      },
      {
        inputType: "textfield",
        inputTitle: "Product",
        gridSize: 4,
        inputSetStateFn: setProduct,
        currentValue: product,
        isRequired: true,
      },
      {
        inputType: "textfield",
        inputTitle: "Link",
        gridSize: 4,
        inputSetStateFn: setLink,
        currentValue: link,
        isRequired: false,
      },
      {
        inputType: "select",
        inputTitle: "Interest",
        gridSize: 4,
        inputSetStateFn: setInterest,
        inputOptions: interestOptions,
        currentValue: interest,
        isRequired: true,
      },
      {
        inputType: "daterange",
        inputTitle: ["Start Date", "End Date"],
        gridSize: 8,
        inputSetStateFn: setDateInterval,
        currentValue: dateInterval,
        isRequired: false,
      },
      {
        inputType: "autocomplete",
        inputTitle: "Type",
        gridSize: 4,
        inputSetStateFn: (e, newValue) => {
          setType(newValue);
          setSubType("");
        },
        inputOptions: Object.keys(tagsOptions),
        currentValue: type,
        isRequired: false,
      },
      {
        inputType: "autocomplete",
        inputTitle: "Sub Type",
        gridSize: 4,
        inputSetStateFn: (e, newValue) => {
          setSubType(newValue);
        },
        inputOptions:
          tagsOptions[type] === undefined ? [""] : tagsOptions[type],
        currentValue: subType,
        isRequired: false,
      },
      {
        inputType: "select",
        inputTitle: "Buy Type",
        gridSize: 4,
        inputSetStateFn: setBuyType,
        inputOptions: buyTypeOptions,
        currentValue: buyType,
        isRequired: false,
      },
    ]);
  }, [
    proxy,
    product,
    link,
    interest,
    interestOptions,
    dateInterval,
    tagsOptions,
    type,
    subType,
    buyTypeOptions,
    buyType,
  ]);

  return (
    <Grid
      container
      spacing={2}
      justifyContent="center"
      alignItems="center"
      sx={{ pl: 5, pr: 5, height: "100%" }}
    >
      <Grid item xs={12} id="interestsTable" sx={{ height: "100%" }}>
        <Card elevation={5} sx={{ height: "100%" }}>
          {interestsList.length !== 0 ? (
            <CardHeader
              title="Interests"
              action={
                <Button
                  variant="contained"
                  background-color="primary"
                  onClick={showInterestsForm}
                >
                  <AddIcon />
                </Button>
              }
            />
          ) : (
            <CardHeader title="Interests" />
          )}
          <CardContent>
            {interestsList.length !== 0 ? (
              <EnhancedTable
                defaultOrderBy=""
                tableData={interestsList}
                tableHeadcells={interestsHeadcells}
                editFunction={handleInterestsEditClick}
                deleteFunction={handleInterestsDeleteClick}
                keyOrder={keyOrder}
                isEditable={true}
                isDeletable={true}
                searchOptions={searchOptions}
                filterOptions={filterOptions}
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
                    You have no Interests currently...
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="h6">
                    Click the button to add your first!
                  </Typography>
                </Grid>
                <Grid item>
                  <Button variant="contained" onClick={showInterestsForm}>
                    <AddIcon />
                  </Button>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>
      </Grid>

      {formPopupInterests && (
        <Form
          openBool={formPopupInterests}
          onCloseFn={hideInterestsForm}
          onSubmitFn={(editBool) => {
            parseInterestFormIntoDb(
              product,
              proxy,
              link,
              dateInterval,
              interest,
              buyType,
              type,
              subType,
              editBool
            );
          }}
          inputFields={inputFields}
          formTitle="Interests"
          editBool={false}
          userPreferences={null}
          dynamicAdd={() => {}}
          dynamicRemove={() => {}}
        />
      )}

      {formPopupEdit && (
        <Form
          openBool={formPopupEdit}
          onCloseFn={hideEditForm}
          onSubmitFn={(editBool) => {
            parseInterestFormIntoDb(
              product,
              proxy,
              link,
              dateInterval,
              interest,
              buyType,
              type,
              subType,
              editBool
            );
          }}
          inputFields={inputFields}
          formTitle="Interests"
          editBool={true}
          userPreferences={null}
          dynamicAdd={() => {}}
          dynamicRemove={() => {}}
        />
      )}
    </Grid>
  );
}

export default Interests;
