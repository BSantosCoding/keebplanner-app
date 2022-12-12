import {
  Typography,
  Autocomplete,
  TextField,
  IconButton,
  Switch,
  FormControlLabel,
  FormGroup,
  Popover,
  Grid,
} from "@mui/material";
import React, { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  set,
  ref,
  onValue,
  off,
  get,
  update,
  increment,
} from "@firebase/database";
import { db } from "./../../Firebase/firebase";
import { AuthContext } from "./../../context/Context";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import HelpIcon from "@mui/icons-material/Help";

function Account() {
  const [tag, setTag] = useState("");
  const [subTag, setSubTag] = useState("");
  const [status, setStatus] = useState("");
  const [buyType, setBuyType] = useState("");
  const [interest, setInterest] = useState("");

  const [tagsOptions, setTagsOptions] = useState({});
  const [statusOptions, setStatusOptions] = useState([]);
  const [buyTypeOptions, setBuyTypeOptions] = useState([]);
  const [interestOptions, setInterestOptions] = useState([]);

  const [userPreferences, setUserPreferences] = useState({
    onlyCountDelivered: false,
    requireInventory: false,
    showAllParts: true,
    countAllForUnitPrice: true,
    darkMode: true,
  });

  const [purchasesData, setPurchasesData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [partsData, setPartsData] = useState([]);
  const [buildsData, setBuildsData] = useState([]);

  const [popoverAnchor, setPopoverAnchor] = useState(null);

  const { user } = useContext(AuthContext);
  const history = useNavigate();

  var baseStatusOptions = [
    "",
    "Delivered",
    "Shipped",
    "Customs",
    "Scam",
    "Waiting for Shipping",
  ];
  var baseBuyTypeOptions = ["", "Group Buy", "Extras", "In-Stock", "Giveaway"];
  var baseInterestOptions = ["", "Waiting", "Interested"];

  useEffect(() => {
    if (!user) {
      return history("/", { replace: true });
    } else {
      if (!user.emailVerified) {
        alert("Verify your email!");
        return history("/", { replace: true });
      }
    }
    onValue(ref(db, "tags/" + user?.uid), (snapshot) => {
      setTagsOptions({
        "": [""],
        ...snapshot.val(),
      });
    });
    onValue(ref(db, "status/" + user?.uid), (snapshot) => {
      setStatusOptions(snapshot.val().Options);
    });
    onValue(ref(db, "buytype/" + user?.uid), (snapshot) => {
      setBuyTypeOptions(snapshot.val().Options);
    });
    onValue(ref(db, "interest/" + user?.uid), (snapshot) => {
      setInterestOptions(snapshot.val().Options);
    });
    get(ref(db, "userpreferences/" + user?.uid)).then((snapshot) => {
      if (snapshot.exists()) {
        setUserPreferences(snapshot.val());
      } else {
        setUserPreferences({
          onlyCountDelivered: false,
          requireInventory: false,
          showAllParts: true,
          countAllForUnitPrice: true,
          darkMode: true,
        });
        set(ref(db, "userpreferences/" + user?.uid), {
          onlyCountDelivered: false,
          requireInventory: false,
          showAllParts: true,
          countAllForUnitPrice: true,
          darkMode: true,
        });
      }
    });
    onValue(ref(db, "purchases/" + user?.uid + "/"), (snapshot) => {
      let tmpList = [];
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        data["key"] = childSnapshot.key;
        tmpList.push(data);
      });
      setPurchasesData(tmpList);
    });
    onValue(ref(db, "sales/" + user?.uid + "/"), (snapshot) => {
      let tmpList = [];
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        data["key"] = childSnapshot.key;
        tmpList.push(data);
      });
      setSalesData(tmpList);
    });
    onValue(ref(db, "builds/" + user?.uid + "/"), (snapshot) => {
      let tmpList = [];
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        data["key"] = childSnapshot.key;
        tmpList.push(data);
      });
      setBuildsData(tmpList);
    });
    onValue(ref(db, "parts/" + user?.uid + "/"), (snapshot) => {
      let tmpList = [];
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        data["key"] = childSnapshot.key;
        tmpList.push(data);
      });
      setPartsData(tmpList);
    });
    return () => {
      off(ref(db, "status/" + user?.uid));
      off(ref(db, "tags/" + user?.uid));
      off(ref(db, "buytype/" + user?.uid));
      off(ref(db, "interest/" + user?.uid));
      off(ref(db, "purchases/" + user?.uid + "/"));
      off(ref(db, "parts/" + user?.uid + "/"));
      off(ref(db, "sales/" + user?.uid + "/"));
      off(ref(db, "builds/" + user?.uid + "/"));
    };
  }, [user, history]);

  const handleDeleteTags = () => {
    let newTagsOptions = tagsOptions;
    delete newTagsOptions[""];

    if (subTag === "" && !subTag) delete newTagsOptions[tag];
    else {
      newTagsOptions[tag].splice(newTagsOptions[tag].indexOf(subTag), 1);
    }

    set(ref(db, "tags/" + user?.uid), {
      ...newTagsOptions,
    });

    setTag("");
    setSubTag("");
  };

  const handleAddTags = () => {
    let newTagsOptions = tagsOptions;
    delete newTagsOptions[""];

    if (newTagsOptions.hasOwnProperty(tag))
      newTagsOptions[tag] = [...new Set([...newTagsOptions[tag], subTag])];
    else {
      if (subTag === "" && !subTag) newTagsOptions[tag] = [""];
      else newTagsOptions[tag] = [...new Set(["", subTag])];
    }

    set(ref(db, "tags/" + user?.uid), {
      ...newTagsOptions,
    });

    setTag("");
    setSubTag("");
  };

  const handleDeleteStatus = () => {
    let newStatusOptions = statusOptions;

    if (!baseStatusOptions.includes(status)) {
      newStatusOptions.splice(newStatusOptions.indexOf(status), 1);
      set(ref(db, "status/" + user?.uid), {
        Options: newStatusOptions,
      });
    }

    setStatus("");
  };

  const handleAddStatus = () => {
    let newStatusOptions = statusOptions;

    newStatusOptions = [...new Set([...newStatusOptions, status])];
    set(ref(db, "status/" + user?.uid), {
      Options: newStatusOptions,
    });

    setStatus("");
  };

  const handleDeleteBuyType = () => {
    let newBuyTypeOptions = buyTypeOptions;

    if (!baseBuyTypeOptions.includes(buyType)) {
      newBuyTypeOptions.splice(newBuyTypeOptions.indexOf(buyType), 1);
      set(ref(db, "buytype/" + user?.uid), {
        Options: newBuyTypeOptions,
      });
    }

    setBuyType("");
  };

  const handleAddBuyType = () => {
    let newBuyTypeOptions = buyTypeOptions;

    newBuyTypeOptions = [...new Set([...newBuyTypeOptions, buyType])];
    set(ref(db, "buytype/" + user?.uid), {
      Options: newBuyTypeOptions,
    });

    setBuyType("");
  };

  const handleDeleteInterest = () => {
    let newInterestOptions = interestOptions;

    if (!baseInterestOptions.includes(interest)) {
      newInterestOptions.splice(newInterestOptions.indexOf(interest), 1);
      set(ref(db, "interest/" + user?.uid), {
        Options: newInterestOptions,
      });
    }

    setInterest("");
  };

  const handleAddInterest = () => {
    let newInterestOptions = interestOptions;

    newInterestOptions = [...new Set([...newInterestOptions, interest])];
    set(ref(db, "interest/" + user?.uid), {
      Options: newInterestOptions,
    });

    setInterest("");
  };

  const handlePreferenceSwitch = (event) => {
    setUserPreferences({
      ...userPreferences,
      [event.target.name]: event.target.checked,
    });

    update(ref(db, "userpreferences/" + user?.uid), {
      ...userPreferences,
      [event.target.name]: event.target.checked,
    });

    rewritePartsData({
      ...userPreferences,
      [event.target.name]: event.target.checked,
    });
  };

  const rewritePartsData = useCallback(
    (userPreference) => {
      //Blank slate parts
      partsData.forEach((part) => {
        update(ref(db, "parts/" + user?.uid + "/" + part.key), {
          Quantity: 0,
          purchasedPrice: 0.0,
          purchasedQuantity: 0,
          soldPrice: 0.0,
          soldQuantity: 0,
        });
      });

      //Update parts taking into consideration new userPreferences
      purchasesData.forEach((purchase) => {
        purchase.Parts.forEach((part) => {
          update(ref(db, "parts/" + user?.uid + "/" + part.PartKey), {
            Quantity: userPreference.onlyCountDelivered
              ? purchase.Status === "Delivered"
                ? increment(part.Quantity)
                : increment(0)
              : increment(part.Quantity),
            purchasedPrice: userPreference.onlyCountDelivered
              ? userPreference.countAllForUnitPrice
                ? purchase.Status === "Delivered"
                  ? increment(part.Price)
                  : increment(0)
                : purchase.Status === "Delivered" &&
                  purchase.BuyType !== "Giveaway" &&
                  part.Price !== 0
                ? increment(part.Price)
                : increment(0)
              : userPreference.countAllForUnitPrice
              ? increment(part.Price)
              : purchase.BuyType !== "Giveaway" && part.Price !== 0
              ? increment(part.Price)
              : increment(0),
            purchasedQuantity: userPreference.onlyCountDelivered
              ? userPreference.countAllForUnitPrice
                ? purchase.Status === "Delivered"
                  ? increment(part.Quantity)
                  : increment(0)
                : purchase.Status === "Delivered" &&
                  purchase.BuyType !== "Giveaway" &&
                  part.Price !== 0
                ? increment(part.Quantity)
                : increment(0)
              : userPreference.countAllForUnitPrice
              ? increment(part.Quantity)
              : purchase.BuyType !== "Giveaway" && part.Price !== 0
              ? increment(part.Quantity)
              : increment(0),
          });
        });
      });

      salesData.forEach((sale) => {
        sale.Parts.forEach((part) => {
          update(ref(db, "parts/" + user?.uid + "/" + part.PartKey), {
            Quantity: increment(-part.Quantity),
            soldPrice: increment(part.Price),
            soldQuantity: increment(part.Price),
          });
        });
      });

      buildsData.forEach((build) => {
        build.PartsUsed.forEach((part) => {
          update(ref(db, "parts/" + user?.uid + "/" + part.PartKey), {
            Quantity: increment(-part.Quantity),
          });
        });
      });
    },
    [user, partsData, buildsData, purchasesData, salesData]
  );

  return (
    <Grid container spacing={2} sx={{ pl: 5, pr: 5 }}>
      <Grid container item spacing={2} alignItems='center'>
        <Typography variant='h4'>Change Classification Options</Typography>
      </Grid>
      <Grid container item spacing={2} alignItems='center'>
        <Grid container item spacing={2} alignItems='center'>
          <Typography variant='h5'>Add/Remove Tags and Subtags:</Typography>
        </Grid>
        <Grid container item spacing={2} alignItems='center'>
          <Typography variant='body2'>
            To add new Tags/Subtags fill the boxes with new names and press the
            plus, to remove them select existing Tags/Subtags from the drop down
            and press the minus.
          </Typography>
        </Grid>
      </Grid>
      {tagsOptions !== undefined && (
        <Grid container item spacing={2}>
          <form id='tForm'>
            <Grid container item spacing={2} alignItems='center'>
              <Grid item xs>
                <Autocomplete
                  disablePortal
                  freeSolo
                  id='tagInput'
                  options={Object.keys(tagsOptions)}
                  value={tag}
                  onChange={(e, newValue) => {
                    setTag(newValue);
                  }}
                  onInputChange={(e, newInputValue) => {
                    setTag(newInputValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      sx={{ width: "8rem" }}
                      {...params}
                      label='Tag'
                      variant='standard'
                      required
                    />
                  )}
                />
              </Grid>
              <Grid item>
                <Autocomplete
                  disablePortal
                  freeSolo
                  id='subTagInput'
                  options={
                    tagsOptions[tag] === undefined ? [""] : tagsOptions[tag]
                  }
                  value={subTag}
                  onChange={(e, newValue) => {
                    setSubTag(newValue);
                  }}
                  onInputChange={(e, newInputValue) => {
                    setSubTag(newInputValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      sx={{ width: "8rem" }}
                      {...params}
                      label='Sub Tag'
                      variant='standard'
                    />
                  )}
                />
              </Grid>
              <Grid item>
                <IconButton
                  onClick={() => {
                    handleDeleteTags();
                  }}
                >
                  <RemoveIcon />
                </IconButton>
              </Grid>
              <Grid item>
                <IconButton
                  onClick={() => {
                    handleAddTags();
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Grid>
            </Grid>
          </form>
        </Grid>
      )}
      <Grid container item spacing={2}>
        <Grid container item spacing={2} alignItems='center'>
          <Grid container item spacing={2} alignItems='center'>
            <Typography variant='h5'>Add/Remove Status:</Typography>
          </Grid>
          <Grid container item spacing={2} alignItems='center'>
            <Typography variant='body2'>
              To add new Status fill the box with new names and press the plus,
              to remove them select existing Status from the drop down and press
              the minus.
            </Typography>
          </Grid>
        </Grid>
        {statusOptions !== undefined && (
          <Grid container item spacing={2}>
            <form id='sForm'>
              <Grid container item spacing={2} alignItems='center'>
                <Grid item>
                  <Autocomplete
                    disablePortal
                    freeSolo
                    id='statusInput'
                    options={statusOptions}
                    value={status}
                    onChange={(e, newValue) => {
                      setStatus(newValue);
                    }}
                    onInputChange={(e, newInputValue) => {
                      setStatus(newInputValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        sx={{ width: "8rem" }}
                        {...params}
                        label='Status'
                        variant='standard'
                        required
                      />
                    )}
                  />
                </Grid>
                <Grid item>
                  <IconButton
                    onClick={() => {
                      handleDeleteStatus();
                    }}
                  >
                    <RemoveIcon />
                  </IconButton>
                </Grid>
                <Grid item>
                  <IconButton
                    onClick={() => {
                      handleAddStatus();
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </form>
          </Grid>
        )}
      </Grid>
      <Grid container item spacing={2}>
        <Grid container item spacing={2} alignItems='center'>
          <Grid container item spacing={2} alignItems='center'>
            <Typography variant='h5'>Add/Remove Buy Types:</Typography>
          </Grid>
          <Grid container item spacing={2} alignItems='center'>
            <Typography variant='body2'>
              To add new Buy Types fill the box with new names and press the
              plus, to remove them select existing Buy Types from the drop down
              and press the minus.
            </Typography>
          </Grid>
        </Grid>
        {buyTypeOptions !== undefined && (
          <Grid container item spacing={2}>
            <form id='btForm'>
              <Grid container item spacing={2} alignItems='center'>
                <Grid item>
                  <Autocomplete
                    disablePortal
                    freeSolo
                    id='buyTypeInput'
                    options={buyTypeOptions}
                    value={buyType}
                    onChange={(e, newValue) => {
                      setBuyType(newValue);
                    }}
                    onInputChange={(e, newInputValue) => {
                      setBuyType(newInputValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        sx={{ width: "8rem" }}
                        {...params}
                        label='Buy Type'
                        variant='standard'
                        required
                      />
                    )}
                  />
                </Grid>
                <Grid item>
                  <IconButton
                    onClick={() => {
                      handleDeleteBuyType();
                    }}
                  >
                    <RemoveIcon />
                  </IconButton>
                </Grid>
                <Grid item>
                  <IconButton
                    onClick={() => {
                      handleAddBuyType();
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </form>
          </Grid>
        )}
      </Grid>
      <Grid container item spacing={2}>
        <Grid container item spacing={2} alignItems='center'>
          <Grid container item spacing={2} alignItems='center'>
            <Typography variant='h5'>Add/Remove Interest:</Typography>
          </Grid>
          <Grid container item spacing={2} alignItems='center'>
            <Typography variant='body2'>
              To add new Interests fill the box with new names and press the
              plus, to remove them select existing Interests from the drop down
              and press the minus.
            </Typography>
          </Grid>
        </Grid>
        {interestOptions !== undefined && (
          <Grid container item spacing={2}>
            <form id='btForm'>
              <Grid container item spacing={2} alignItems='center'>
                <Grid item>
                  <Autocomplete
                    disablePortal
                    freeSolo
                    id='interestInput'
                    options={interestOptions}
                    value={interest}
                    onChange={(e, newValue) => {
                      setInterest(newValue);
                    }}
                    onInputChange={(e, newInputValue) => {
                      setInterest(newInputValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        sx={{ width: "8rem" }}
                        {...params}
                        label='Interest'
                        variant='standard'
                        required
                      />
                    )}
                  />
                </Grid>
                <Grid item>
                  <IconButton
                    onClick={() => {
                      handleDeleteInterest();
                    }}
                  >
                    <RemoveIcon />
                  </IconButton>
                </Grid>
                <Grid item>
                  <IconButton
                    onClick={() => {
                      handleAddInterest();
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </form>
          </Grid>
        )}
      </Grid>
      <Grid container item spacing={2}>
        <Grid container item spacing={2} alignItems='center'>
          <Typography variant='h5'>Preferences:</Typography>
        </Grid>
        {userPreferences !== undefined && (
          <Grid container item spacing={2} alignItems='center'>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={userPreferences.onlyCountDelivered}
                    onChange={handlePreferenceSwitch}
                    name='onlyCountDelivered'
                  />
                }
                label='Only count Inventory for Delivered Purchases'
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={userPreferences.requireInventory}
                    onChange={handlePreferenceSwitch}
                    name='requireInventory'
                  />
                }
                label='Require Inventory for Sales/Builds'
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={userPreferences.showAllParts}
                    onChange={handlePreferenceSwitch}
                    name='showAllParts'
                  />
                }
                label='Show Parts independent of Quantity'
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={userPreferences.countAllForUnitPrice}
                    onChange={handlePreferenceSwitch}
                    name='countAllForUnitPrice'
                  />
                }
                label='Count Giveaways and Free purchases for Parts Unit Price'
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={userPreferences.darkMode}
                    onChange={handlePreferenceSwitch}
                    name='darkMode'
                  />
                }
                label='Enable/Disable Dark Mode'
              />
            </FormGroup>
          </Grid>
        )}
      </Grid>
    </Grid>
  );
}

export default Account;
