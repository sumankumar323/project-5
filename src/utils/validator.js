//request body validation
const isValidRequest = (el) => Object.keys(el).length > 0;

//value validation
const isValidValue = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  if (typeof value === "number") return false;
  return true;
};



//const isValidObjectId = (el)

module.exports={isValidRequest,isValidValue}