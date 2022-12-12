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
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Grid,
  IconButton,
  List,
  ListItem,
  Typography,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import Form from "../Form/Form";

function Builds() {
  const { user } = useContext(AuthContext);
  const [formPopupBuilds, setFormPopupBuilds] = useState(false);
  const [formPopupEdit, setFormPopupEdit] = useState(false);

  //Retrive list of existing Parts
  const [partsList, setPartsList] = useState({});
  const [partsNameList, setPartsNameList] = useState([]);
  const [filteredPartsNames, setFilteredPartsNames] = useState([]);

  //Retrive list of existing Builds
  const [buildsList, setBuildsList] = useState([]);

  //Edit Form
  const [editKey, setEditKey] = useState("");
  const [editIndex, setEditIndex] = useState(0);

  const history = useNavigate();

  //User preferences
  const [userPreferences, setUserPreferences] = useState({
    onlyCountDelivered: false,
    requireInventory: false,
    showAllParts: true,
    countAllForUnitPrice: true,
  });

  //Builds Form
  const [buildsInputList, setBuildsInputList] = useState([
    {
      quantityInput: [
        0,
        {
          inputType: "number",
          inputTitle: "Quantity",
          gridSize: 5,
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
          gridSize: 5,
        },
      ],
    },
  ]);
  const [projectName, setProjectName] = useState("");
  const [imageLink, setImageLink] = useState("");

  useEffect(() => {
    let tmpInputList = buildsInputList;
    tmpInputList.forEach((input) => {
      input.partInput[1].inputOptions = userPreferences.requireInventory
        ? filteredPartsNames
        : partsNameList;
    });

    setBuildsInputList(tmpInputList);
  }, [filteredPartsNames, partsNameList, userPreferences, buildsInputList]);

  useEffect(() => {
    onValue(ref(db, "parts/" + user?.uid + "/"), (snapshot) => {
      var partAssociation = partsList;
      var filteredNames = [""];
      var nameList = [""];
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        data["key"] = childSnapshot.key;
        nameList = [...nameList, data.Name];
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
        };
        partAssociation[data.Name] = parsedData;
        if (parseInt(data.Quantity) > 0) {
          filteredNames = [...filteredNames, data.Name];
        }
      });
      setPartsNameList(nameList);
      setPartsList(partAssociation);
      setFilteredPartsNames(filteredNames);
    });
    onValue(ref(db, "builds/" + user?.uid + "/"), (snapshot) => {
      let list = [];
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        data["key"] = childSnapshot.key;
        list = [...list, data];
      });
      setBuildsList(list);
    });
    onValue(ref(db, "userpreferences/" + user?.uid), (snapshot) => {
      setUserPreferences(snapshot.val());
    });
    return () => {
      off(ref(db, "userpreferences/" + user?.uid));
      off(ref(db, "parts/" + user?.uid + "/"));
      off(ref(db, "builds/" + user?.uid + "/"));
    };
  }, [user, partsList, history]);

  const showBuildsForm = useCallback(() => {
    setFormPopupBuilds(true);
  }, []);

  const hideBuildsForm = useCallback(() => {
    setFormPopupBuilds(false);
    if (formPopupBuilds) {
      setBuildsInputList([
        {
          quantityInput: [
            0,
            {
              inputType: "number",
              inputTitle: "Quantity",
              gridSize: 5,
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
              gridSize: 5,
            },
          ],
        },
      ]);
      setProjectName("");
      setImageLink("");
    }
  }, [formPopupBuilds, userPreferences, filteredPartsNames, partsNameList]);

  const showEditForm = useCallback(() => {
    setFormPopupEdit(true);
  }, []);

  const hideEditForm = useCallback(() => {
    setFormPopupEdit(false);
    if (formPopupEdit) {
      setBuildsInputList([
        {
          quantityInput: [
            0,
            {
              inputType: "number",
              inputTitle: "Quantity",
              gridSize: 5,
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
              gridSize: 5,
            },
          ],
        },
      ]);
      setProjectName("");
      setImageLink("");
    }
  }, [formPopupEdit, filteredPartsNames, partsNameList, userPreferences]);

  const handleBuildsEditClick = (editData, editIndex) => {
    setEditKey(editData.key);
    setEditIndex(editIndex);

    let list = [];
    editData.PartsUsed.forEach((part) => {
      list = [
        ...list,
        {
          quantityInput: [
            part.Quantity,
            {
              inputType: "number",
              inputTitle: "Quantity",
              gridSize: 5,
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
              gridSize: 5,
            },
          ],
        },
      ];
    });

    setBuildsInputList(list);
    setProjectName(editData.ProjectName);
    setImageLink(editData.ImageLink);

    showEditForm();
  };

  const handleDeleteClick = (editIndex, editKey) => {
    buildsList[editIndex].PartsUsed.forEach((x) => {
      update(ref(db, "parts/" + user?.uid + "/" + x.PartKey), {
        Quantity: increment(x.Quantity),
      });
    });
    remove(ref(db, "builds/" + user?.uid + "/" + editKey));
  };

  const handleAddClick = () => {
    setBuildsInputList([
      ...buildsInputList,
      {
        quantityInput: [
          0,
          {
            inputType: "number",
            inputTitle: "Quantity",
            gridSize: 5,
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
            gridSize: 5,
          },
        ],
      },
    ]);
  };

  const handleRemoveClick = (index) => {
    const list = [...buildsInputList];
    list.splice(index, 1);
    setBuildsInputList(list);
  };

  const handleInputChange = useCallback(
    (name, value, index) => {
      const list = [...buildsInputList];
      list[index][name][0] = value;
      setBuildsInputList(list);
    },
    [buildsInputList]
  );

  const parseBuildFormIntoDb = useCallback(
    (projectName, imageLink, buildsInputList, edit) => {
      if (edit) {
        hideEditForm();
        buildsList[editIndex].PartsUsed.forEach((x, i) => {
          update(ref(db, "parts/" + user?.uid + "/" + x.PartKey), {
            Quantity: increment(buildsList[editIndex].PartsUsed[i].Quantity),
          });
        });
        remove(ref(db, "builds/" + user?.uid + "/" + editKey));
      } else hideBuildsForm();

      const data = {
        ProjectName: projectName,
        ImageLink: imageLink,
        PartsUsed: buildsInputList.map((x) => {
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
              soldPrice: 0.0,
              soldQuantity: 0,
            });
          } else {
            partKey = partsList[x.partInput[0]].key;
            update(ref(db, "parts/" + user?.uid + "/" + partKey), {
              Quantity: increment(-parseInt(x.quantityInput[0])),
            });
          }

          return {
            Quantity: parseInt(x.quantityInput[0]),
            PartName: x.partInput[0],
            PartKey: partKey,
          };
        }),
      };

      const newBuildKey = push(child(ref(db), "builds/" + user?.uid + "/")).key;
      set(ref(db, "builds/" + user?.uid + "/" + newBuildKey), data);
    },
    [
      user,
      partsList,
      partsNameList,
      buildsList,
      editIndex,
      editKey,
      hideEditForm,
      hideBuildsForm,
    ]
  );

  const [inputFieldsBuilds, setInputFieldsBuilds] = useState([
    {
      inputType: "textfield",
      inputTitle: "Project Name",
      gridSize: 6,
      inputSetStateFn: setProjectName,
      currentValue: projectName,
      isRequired: true,
    },
    {
      inputType: "textfield",
      inputTitle: "Image Link",
      gridSize: 6,
      inputSetStateFn: setImageLink,
      currentValue: imageLink,
      isRequired: false,
    },
    {
      inputType: "dynamic",
      inputTitle: "PartArray",
      currentValue: buildsInputList,
      inputSetStateFn: handleInputChange,
      gridSize: 12,
      isRequired: true,
    },
  ]);

  useEffect(() => {
    setInputFieldsBuilds([
      {
        inputType: "textfield",
        inputTitle: "Project Name",
        gridSize: 6,
        inputSetStateFn: setProjectName,
        currentValue: projectName,
        isRequired: true,
      },
      {
        inputType: "textfield",
        inputTitle: "Image Link",
        gridSize: 6,
        inputSetStateFn: setImageLink,
        currentValue: imageLink,
        isRequired: false,
      },
      {
        inputType: "dynamic",
        inputTitle: "PartArray",
        currentValue: buildsInputList,
        inputSetStateFn: handleInputChange,
        gridSize: 12,
        isRequired: true,
      },
    ]);
  }, [projectName, imageLink, buildsInputList, handleInputChange]);

  return (
    <Grid
      container
      spacing={2}
      justifyContent='center'
      alignItems='center'
      sx={{ pl: 5, pr: 5, height: "100%" }}
    >
      <Grid item xs={12} id='buildsTable' sx={{ height: "100%" }}>
        <Card elevation={3} sx={{ height: "100%" }}>
          {buildsList.length !== 0 ? (
            <CardHeader
              title='Builds'
              action={
                <Button variant='contained' onClick={showBuildsForm}>
                  <AddIcon />
                </Button>
              }
            />
          ) : (
            <CardHeader title='Builds' />
          )}
          <CardContent sx={{ maxHeight: "75vh", overflow: "auto" }}>
            <Grid container spacing={2} style={{ display: "flex" }}>
              {buildsList.length !== 0 ? (
                buildsList.map((build, i) => {
                  let buildPrice = 0;
                  return (
                    <Grid
                      item
                      xs={6}
                      sm={4}
                      md={3}
                      key={build.ProjectName + i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        flexDirection: "column",
                      }}
                    >
                      <Card elevation={5} sx={{ height: "100%" }}>
                        <CardMedia
                          component='img'
                          height='200'
                          alt='...'
                          image={
                            build.ImageLink === ""
                              ? "https://i.imgur.com/D3W90k1.jpg"
                              : build.ImageLink
                          }
                        />
                        <CardContent>
                          <Typography gutterBottom variant='h5' component='div'>
                            {build.ProjectName}
                          </Typography>
                          <Typography variant='h6'>Parts used:</Typography>
                          <List>
                            {build.PartsUsed.map((part, i) => {
                              buildPrice =
                                buildPrice +
                                partsList[part.PartName].UnitPrice *
                                  part.Quantity;
                              return (
                                <ListItem key={i}>
                                  {part.Quantity + "x " + part.PartName}
                                </ListItem>
                              );
                            })}
                          </List>
                          <Typography variant='h6'>
                            Cost: {parseFloat(buildPrice).toFixed(2)}
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <Grid
                            container
                            spacing={2}
                            justifyContent='center'
                            alignItems='center'
                          >
                            <IconButton
                              onClick={() => {
                                handleBuildsEditClick(build, i);
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => {
                                handleDeleteClick(i, build.key);
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Grid>
                        </CardActions>
                      </Card>
                    </Grid>
                  );
                })
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
                      You have no Builds currently...
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant='h6'>
                      Click the button to add your first!
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Button variant='contained' onClick={showBuildsForm}>
                      <AddIcon />
                    </Button>
                  </Grid>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {formPopupBuilds && (
        <Form
          openBool={formPopupBuilds}
          onCloseFn={hideBuildsForm}
          onSubmitFn={(editBool) => {
            parseBuildFormIntoDb(
              projectName,
              imageLink,
              buildsInputList,
              editBool
            );
          }}
          inputFields={inputFieldsBuilds}
          formTitle='Builds'
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
            parseBuildFormIntoDb(
              projectName,
              imageLink,
              buildsInputList,
              editBool
            );
          }}
          inputFields={inputFieldsBuilds}
          formTitle='Builds'
          editBool={true}
          userPreferences={userPreferences}
          dynamicAdd={handleAddClick}
          dynamicRemove={handleRemoveClick}
        />
      )}
    </Grid>
  );
}

export default Builds;
