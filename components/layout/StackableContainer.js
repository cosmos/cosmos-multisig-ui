const StackableContainer = (props) => (
  <div className={`container ${props.base ? "base" : ""}`}>
    {props.children}

    <style jsx>{`
      .container {
        background: rgba(255, 255, 255, 0.05);
        padding: ${props.lessPadding ? "15px" : "30px"};
        margin-top: ${props.lessMargin || props.base ? "25px" : "50px"};
        border-radius: ${props.lessRadius ? "10px" : "20px"};

        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;
        height: ${props.fullHeight ? "100%" : "auto"};
      }

      .container:first-child {
        margin-top: 0;
      }

      .base {
        max-width: 750px;
        background: #62145f;
        box-shadow: 0px 28px 80px rgba(0, 0, 0, 0.07),
          0px 12.7134px 39.2617px rgba(0, 0, 0, 0.0519173),
          0px 7.26461px 23.349px rgba(0, 0, 0, 0.0438747),
          0px 4.44678px 14.5028px rgba(0, 0, 0, 0.0377964),
          0px 2.71437px 8.88638px rgba(0, 0, 0, 0.0322036),
          0px 1.53495px 5.02137px rgba(0, 0, 0, 0.0261253),
          0px 0.671179px 2.19114px rgba(0, 0, 0, 0.0180827);
      }
    `}</style>
  </div>
);
export default StackableContainer;
